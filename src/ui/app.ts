namespace DAI {
  export class InspectorApp {
    private root!: HTMLDivElement;
    private grid!: HTMLDivElement;
    private countEl!: HTMLElement;
    private sourceCountEl!: HTMLElement;
    private statusTextEl!: HTMLElement;
    private progressEl!: HTMLElement;
    private searchEl!: HTMLInputElement;
    private extensionEl!: HTMLSelectElement;
    private sourceEl!: HTMLSelectElement;
    private sortEl!: HTMLSelectElement;
    private lazyButton!: HTMLButtonElement;
    private visible: AssetRecord[] = [];
    private abortController = new AbortController();
    private closed = false;

    readonly registry = new AssetRegistry();
    readonly webpack = new WebpackScanner(this.registry);

    constructor(private readonly onClose: () => void) {}

    async start(): Promise<void> {
      this.webpack.connect();
      this.renderShell();
      await this.rescan();
    }

    private renderShell(): void {
      document.getElementById(ROOT_ID)?.remove();
      this.root = document.createElement("div");
      this.root.id = ROOT_ID;
      this.root.innerHTML = `
        <style>${STYLES}</style>
        <div class="dai-backdrop"></div>
        <section class="dai-panel" role="dialog" aria-modal="true" aria-label="Discord Asset Inspector">
          <header class="dai-head">
            <div class="dai-brand"><div class="dai-title">Discord Asset Inspector</div><div class="dai-sub">v${VERSION} · local developer utility</div></div>
            <div class="dai-spacer"></div>
            <button class="dai-secondary" data-action="rescan">Rescan</button>
            <button class="dai-primary" data-action="lazy">Scan lazy resources</button>
            <button class="dai-secondary" data-action="json">Export JSON</button>
            <button class="dai-close" data-action="close" aria-label="Close">×</button>
          </header>
          <div class="dai-tools">
            <input data-role="search" placeholder="Search filename, URL, source or module…" autocomplete="off" />
            <select data-role="extension"><option value="">All extensions</option></select>
            <select data-role="source"><option value="">All sources</option></select>
            <select data-role="sort"><option value="name">Name</option><option value="extension">Extension</option><option value="source">Source count</option></select>
            <button data-action="copy-all">Copy filtered</button>
          </div>
          <div class="dai-progress"><i data-role="progress"></i></div>
          <div class="dai-status"><span><strong data-role="count">0</strong> assets</span><span><strong data-role="source-count">0</strong> source types</span><span data-role="status">Ready</span></div>
          <div class="dai-grid" data-role="grid"></div>
        </section>`;
      document.body.appendChild(this.root);

      this.grid = this.must<HTMLDivElement>("[data-role=grid]");
      this.countEl = this.must("[data-role=count]");
      this.sourceCountEl = this.must("[data-role=source-count]");
      this.statusTextEl = this.must("[data-role=status]");
      this.progressEl = this.must("[data-role=progress]");
      this.searchEl = this.must<HTMLInputElement>("[data-role=search]");
      this.extensionEl = this.must<HTMLSelectElement>("[data-role=extension]");
      this.sourceEl = this.must<HTMLSelectElement>("[data-role=source]");
      this.sortEl = this.must<HTMLSelectElement>("[data-role=sort]");
      this.lazyButton = this.must<HTMLButtonElement>("[data-action=lazy]");

      const refresh = debounce(() => this.applyFilters(), 120);
      this.searchEl.addEventListener("input", refresh);
      this.extensionEl.addEventListener("change", () => this.applyFilters());
      this.sourceEl.addEventListener("change", () => this.applyFilters());
      this.sortEl.addEventListener("change", () => this.applyFilters());

      this.root.addEventListener("click", event => this.handleClick(event));
      this.root.querySelector(".dai-backdrop")?.addEventListener("click", () => this.close());
      document.addEventListener("keydown", this.onKeydown, true);
    }

    private must<T extends Element = HTMLElement>(selector: string): T {
      const element = this.root.querySelector(selector);
      if (!element) throw new Error("Missing UI element: " + selector);
      return element as T;
    }

    private onKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") this.close();
    };

    private async handleClick(event: Event): Promise<void> {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>("button[data-action]");
      if (!button) return;
      const action = button.dataset.action;

      if (action === "close") return this.close();
      if (action === "rescan") return void this.rescan();
      if (action === "lazy") return void this.scanLazy();
      if (action === "json") return saveJson(this.registry.serialize(), `discord-assets-${Date.now()}.json`);
      if (action === "copy-all") {
        await copyText(this.visible.map(item => item.url).join("\n"));
        this.setStatus(`Copied ${this.visible.length} URLs.`);
        return;
      }

      const card = button.closest<HTMLElement>(".dai-card");
      const url = card?.dataset.url;
      if (!url) return;
      if (action === "copy") {
        await copyText(url);
        this.setStatus("URL copied.");
      } else if (action === "open") {
        window.open(url, "_blank", "noopener,noreferrer");
      } else if (action === "download") {
        await this.downloadAsset(url);
      }
    }

    async rescan(): Promise<void> {
      if (this.closed) return;
      this.setStatus("Scanning loaded resources…");
      this.webpack.connect();
      const reports: ScanReport[] = [
        this.webpack.scanLoadedModules(),
        scanPerformance(this.registry),
        scanDom(this.registry),
        scanCss(this.registry),
        await scanCache(this.registry)
      ];
      const added = reports.reduce((sum, report) => sum + report.added, 0);
      this.rebuildFilters();
      this.applyFilters();
      this.setStatus(`Scan complete · ${added} new asset${added === 1 ? "" : "s"}.`);
    }

    private async scanLazy(): Promise<void> {
      if (this.closed || this.lazyButton.disabled) return;
      this.lazyButton.disabled = true;
      this.setStatus("Scanning lazy Discord resources…");
      this.setProgress(0);
      try {
        const report = await this.webpack.scanLazyResources(this.abortController.signal, (done, total) => {
          this.setProgress(total ? (done / total) * 100 : 0);
          this.setStatus(`Lazy scan ${done}/${total}…`);
        });
        this.rebuildFilters();
        this.applyFilters();
        this.setStatus(`Lazy scan complete · ${report.added} new assets · ${report.failedResources || 0} failed.`);
      } finally {
        this.setProgress(0);
        this.lazyButton.disabled = false;
      }
    }

    private rebuildFilters(): void {
      const extension = this.extensionEl.value;
      const source = this.sourceEl.value;
      const extensions = [...new Set(this.registry.values().map(item => item.extension).filter(Boolean))].sort();
      const sources = [...new Set(this.registry.values().flatMap(item => [...item.sources]))].sort();
      this.extensionEl.innerHTML = `<option value="">All extensions</option>${extensions.map(x => `<option value="${escapeHtml(x)}">${escapeHtml(x.toUpperCase())}</option>`).join("")}`;
      this.sourceEl.innerHTML = `<option value="">All sources</option>${sources.map(x => `<option value="${escapeHtml(x)}">${escapeHtml(x)}</option>`).join("")}`;
      if (extensions.includes(extension)) this.extensionEl.value = extension;
      if (sources.includes(source as AssetSource)) this.sourceEl.value = source;
    }

    private applyFilters(): void {
      const query = this.searchEl.value.trim().toLowerCase();
      const extension = this.extensionEl.value;
      const source = this.sourceEl.value as AssetSource | "";
      const sort = this.sortEl.value;

      this.visible = this.registry.values().filter(item => {
        if (extension && item.extension !== extension) return false;
        if (source && !item.sources.has(source)) return false;
        if (!query) return true;
        return [item.name, item.url, item.extension, ...item.sources, ...item.modules]
          .join(" ")
          .toLowerCase()
          .includes(query);
      });

      this.visible.sort((a, b) => {
        if (sort === "extension") return a.extension.localeCompare(b.extension) || a.name.localeCompare(b.name);
        if (sort === "source") return b.sources.size - a.sources.size || a.name.localeCompare(b.name);
        return a.name.localeCompare(b.name);
      });

      this.renderCards();
      this.countEl.textContent = String(this.visible.length);
      this.sourceCountEl.textContent = String(new Set(this.registry.values().flatMap(item => [...item.sources])).size);
    }

    private renderCards(): void {
      if (!this.visible.length) {
        this.grid.innerHTML = `<div class="dai-empty">No assets match the current filters.</div>`;
        return;
      }

      const limit = 350;
      const html = this.visible.slice(0, limit).map(item => {
        const preview = this.previewHtml(item);
        const chips = [...item.sources].slice(0, 4).map(source => `<span class="dai-chip">${escapeHtml(source)}</span>`).join("");
        return `<article class="dai-card" data-url="${escapeHtml(item.url)}">
          <div class="dai-preview">${preview}</div>
          <div class="dai-body">
            <div class="dai-name" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</div>
            <div class="dai-url" title="${escapeHtml(item.url)}">${escapeHtml(item.url)}</div>
            <div class="dai-chips">${chips}</div>
            <div class="dai-actions"><button data-action="copy">Copy</button><button data-action="open">Open</button><button data-action="download">Save</button></div>
          </div>
        </article>`;
      }).join("");

      this.grid.innerHTML = html + (this.visible.length > limit ? `<div class="dai-empty">Showing first ${limit} of ${this.visible.length} results. Narrow the filters to inspect more.</div>` : "");
    }

    private previewHtml(item: AssetRecord): string {
      const url = escapeHtml(item.url);
      if (IMAGE_EXTENSIONS.has(item.extension)) return `<img loading="lazy" decoding="async" src="${url}" alt="" />`;
      if (VIDEO_EXTENSIONS.has(item.extension)) return `<video preload="metadata" muted src="${url}"></video>`;
      if (AUDIO_EXTENSIONS.has(item.extension)) return `<div class="dai-filetype">AUDIO</div>`;
      if (FONT_EXTENSIONS.has(item.extension)) return `<div class="dai-filetype">FONT</div>`;
      return `<div class="dai-filetype">${escapeHtml(item.extension || "FILE")}</div>`;
    }

    private async downloadAsset(url: string): Promise<void> {
      try {
        const response = await fetch(url, { method: "GET", cache: "force-cache", signal: this.abortController.signal });
        if (!response.ok) throw new Error(String(response.status));
        downloadBlob(await response.blob(), fileName(url));
        this.setStatus("Download prepared.");
      } catch {
        if (!this.closed) window.open(url, "_blank", "noopener,noreferrer");
      }
    }

    private setStatus(text: string): void {
      this.statusTextEl.textContent = text;
    }

    private setProgress(value: number): void {
      this.progressEl.style.setProperty("--p", `${Math.max(0, Math.min(100, value))}%`);
    }

    close(): void {
      if (this.closed) return;
      this.closed = true;
      this.abortController.abort();
      document.removeEventListener("keydown", this.onKeydown, true);
      this.root.remove();
      this.onClose();
    }
  }
}
