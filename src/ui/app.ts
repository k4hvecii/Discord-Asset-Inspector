namespace DAI {
  export class InspectorApp {
    private root!: HTMLDivElement;
    private surface!: ShadowRoot;
    private grid!: HTMLDivElement;
    private countEl!: HTMLElement;
    private selectedCountEl!: HTMLElement;
    private sourceCountEl!: HTMLElement;
    private statusEl!: HTMLElement;
    private progressEl!: HTMLElement;
    private searchEl!: HTMLInputElement;
    private extensionEl!: HTMLSelectElement;
    private sourceEl!: HTMLSelectElement;
    private sortEl!: HTMLSelectElement;
    private copyFormatEl!: HTMLSelectElement;
    private copySelectedButton!: HTMLButtonElement;
    private lazyButton!: HTMLButtonElement;

    private visible: AssetRecord[] = [];
    private selected = new Set<string>();
    private kind: AssetKind | "all" = "all";
    private renderLimit = 80;
    private readonly renderStep = 80;
    private abortController = new AbortController();
    private closed = false;

    readonly registry = new AssetRegistry();
    readonly webpack = new WebpackScanner(this.registry);

    constructor(private readonly onClose: () => void) {}

    async start(): Promise<void> {
      this.renderShell();
      this.webpack.connect();
      await this.rescan();
    }

    private renderShell(): void {
      document.getElementById(ROOT_ID)?.remove();

      this.root = document.createElement("div");
      this.root.id = ROOT_ID;
      this.surface = this.root.attachShadow({ mode: "open" });
      this.surface.innerHTML = `
        <style>${STYLES}</style>
        <div class="app">
          <div class="backdrop" data-action="close"></div>
          <section class="panel" role="dialog" aria-modal="true" aria-label="Discord Asset Inspector">
            <header class="header">
              <div class="brand">
                <strong>Discord Asset Inspector</strong>
                <span>v${VERSION} · yalnız Discord istemci varlıkları</span>
              </div>
              <div class="header-actions">
                <button data-action="rescan">Yeniden tara</button>
                <button class="primary" data-action="lazy">Ek paketleri tara</button>
                <button data-action="json">JSON dışa aktar</button>
                <button class="icon-button" data-action="close" aria-label="Kapat">×</button>
              </div>
            </header>

            <div class="filters">
              <input data-role="search" placeholder="Dosya adı, URL veya modül ara…" autocomplete="off" />
              <select data-role="extension"><option value="">Tüm uzantılar</option></select>
              <select data-role="source"><option value="">Tüm kaynaklar</option></select>
              <select data-role="sort">
                <option value="name">Ada göre</option>
                <option value="extension">Uzantıya göre</option>
                <option value="source">Kaynak sayısına göre</option>
                <option value="module">Modül sayısına göre</option>
              </select>
            </div>

            <nav class="kinds" aria-label="Varlık türleri">
              <button class="active" data-action="kind" data-kind="all">Tümü <b data-count-kind="all">0</b></button>
              <button data-action="kind" data-kind="image">Görseller <b data-count-kind="image">0</b></button>
              <button data-action="kind" data-kind="video">Videolar <b data-count-kind="video">0</b></button>
              <button data-action="kind" data-kind="audio">Sesler <b data-count-kind="audio">0</b></button>
              <button data-action="kind" data-kind="font">Yazı tipleri <b data-count-kind="font">0</b></button>
              <button data-action="kind" data-kind="code">Kod & veri <b data-count-kind="code">0</b></button>
              <button data-action="kind" data-kind="other">Diğer <b data-count-kind="other">0</b></button>
            </nav>

            <div class="bulk">
              <button data-action="select-visible">Görünenleri seç</button>
              <button data-action="clear-selection">Seçimi temizle</button>
              <span class="grow"></span>
              <select data-role="copy-format" aria-label="Kopyalama biçimi">
                <option value="url">URL</option>
                <option value="markdown">Markdown</option>
                <option value="css">CSS url()</option>
                <option value="html">HTML</option>
              </select>
              <button data-action="copy-selected" disabled>Seçilenleri kopyala</button>
            </div>

            <div class="progress"><i data-role="progress"></i></div>

            <div class="statusbar">
              <span><b data-role="count">0</b> görünür</span>
              <span><b data-role="selected-count">0</b> seçili</span>
              <span><b data-role="source-count">0</b> kaynak türü</span>
              <span class="status" data-role="status">Hazır</span>
            </div>

            <main class="grid" data-role="grid"></main>
          </section>
        </div>
      `;

      document.body.appendChild(this.root);

      this.grid = this.must<HTMLDivElement>("[data-role=grid]");
      this.countEl = this.must("[data-role=count]");
      this.selectedCountEl = this.must("[data-role=selected-count]");
      this.sourceCountEl = this.must("[data-role=source-count]");
      this.statusEl = this.must("[data-role=status]");
      this.progressEl = this.must("[data-role=progress]");
      this.searchEl = this.must<HTMLInputElement>("[data-role=search]");
      this.extensionEl = this.must<HTMLSelectElement>("[data-role=extension]");
      this.sourceEl = this.must<HTMLSelectElement>("[data-role=source]");
      this.sortEl = this.must<HTMLSelectElement>("[data-role=sort]");
      this.copyFormatEl = this.must<HTMLSelectElement>("[data-role=copy-format]");
      this.copySelectedButton = this.must<HTMLButtonElement>("[data-action=copy-selected]");
      this.lazyButton = this.must<HTMLButtonElement>("[data-action=lazy]");

      const refresh = debounce(() => this.resetRenderWindow(), 120);
      this.searchEl.addEventListener("input", refresh);
      this.extensionEl.addEventListener("change", () => this.resetRenderWindow());
      this.sourceEl.addEventListener("change", () => this.resetRenderWindow());
      this.sortEl.addEventListener("change", () => this.resetRenderWindow());

      this.surface.addEventListener("click", event => void this.handleClick(event));
      document.addEventListener("keydown", this.onKeydown, true);
    }

    private must<T extends Element = HTMLElement>(selector: string): T {
      const element = this.surface.querySelector(selector);
      if (!element) throw new Error("Eksik arayüz öğesi: " + selector);
      return element as T;
    }

    private onKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") this.close();
    };

    private async handleClick(event: Event): Promise<void> {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-action]");
      if (!button) return;

      const action = button.dataset.action;

      if (action === "close") return this.close();
      if (action === "rescan") return void this.rescan();
      if (action === "lazy") return void this.scanLazy();
      if (action === "json") return saveJson(this.registry.serialize(), `discord-assets-${Date.now()}.json`);

      if (action === "kind") {
        this.kind = (button.dataset.kind || "all") as AssetKind | "all";
        this.surface.querySelectorAll<HTMLButtonElement>(".kinds button").forEach(item => {
          item.classList.toggle("active", item === button);
        });
        this.resetRenderWindow();
        return;
      }

      if (action === "select-visible") {
        this.visible.slice(0, this.renderLimit).forEach(item => this.selected.add(item.url));
        this.applyFilters();
        return;
      }

      if (action === "clear-selection") {
        this.selected.clear();
        this.applyFilters();
        return;
      }

      if (action === "copy-selected") {
        const items = this.registry.values().filter(item => this.selected.has(item.url));
        if (!items.length) return;
        const format = this.copyFormatEl.value as CopyFormat;
        await copyText(items.map(item => formatCopy(item, format)).join("\n"));
        this.setStatus(`${items.length} varlık kopyalandı.`);
        return;
      }

      if (action === "load-more") {
        this.renderLimit += this.renderStep;
        this.renderCards();
        return;
      }

      const card = button.closest<HTMLElement>(".card");
      const url = card?.dataset.url;
      if (!url) return;

      const item = this.registry.get(url);
      if (!item) return;

      if (action === "toggle-select") {
        if (this.selected.has(url)) this.selected.delete(url);
        else this.selected.add(url);
        this.applyFilters();
        return;
      }

      if (action === "copy") {
        await copyText(formatCopy(item, this.copyFormatEl.value as CopyFormat));
        this.setStatus("Kopyalandı.");
        return;
      }

      if (action === "open") {
        window.open(url, "_blank", "noopener,noreferrer");
        return;
      }

      if (action === "download") {
        await this.downloadAsset(url);
      }
    }

    async rescan(): Promise<void> {
      if (this.closed) return;

      this.registry.clear();
      this.selected.clear();
      this.renderLimit = this.renderStep;
      this.setStatus("Discord istemci varlıkları taranıyor…");

      this.webpack.connect();

      const reports: ScanReport[] = [
        scanPerformance(this.registry),
        scanCss(this.registry),
        this.webpack.scanLoadedModules()
      ];

      this.rebuildFilters();
      this.applyFilters();

      const skipped = reports.reduce((sum, report) => sum + (report.skippedAssets || 0), 0);
      this.setStatus(
        `Tarama tamamlandı · ${this.registry.size()} istemci varlığı · ${skipped} ham paket girdisi atlandı.`
      );
    }

    private async scanLazy(): Promise<void> {
      if (this.closed || this.lazyButton.disabled) return;

      this.lazyButton.disabled = true;
      this.setProgress(0);
      this.setStatus("Ek Discord paketleri taranıyor…");

      try {
        const report = await this.webpack.scanLazyResources(
          this.abortController.signal,
          (done, total) => {
            this.setProgress(total ? (done / total) * 100 : 0);
            this.setStatus(`Ek paketler taranıyor · ${done}/${total}`);
          }
        );

        this.rebuildFilters();
        this.applyFilters();
        this.setStatus(
          `Ek tarama tamamlandı · ${report.added} yeni varlık · ${report.skippedAssets || 0} ham giriş atlandı · ${report.failedResources || 0} başarısız.`
        );
      } finally {
        this.setProgress(0);
        this.lazyButton.disabled = false;
      }
    }

    private rebuildFilters(): void {
      const previousExtension = this.extensionEl.value;
      const previousSource = this.sourceEl.value;

      const extensions = [...new Set(this.registry.values().map(item => item.extension))].sort();
      const sources = [...new Set(this.registry.values().flatMap(item => [...item.sources]))].sort();

      this.extensionEl.innerHTML =
        '<option value="">Tüm uzantılar</option>' +
        extensions.map(value => `<option value="${escapeHtml(value)}">${escapeHtml(value.toUpperCase())}</option>`).join("");

      this.sourceEl.innerHTML =
        '<option value="">Tüm kaynaklar</option>' +
        sources.map(value => `<option value="${escapeHtml(value)}">${escapeHtml(sourceLabel(value as AssetSource))}</option>`).join("");

      if (extensions.includes(previousExtension)) this.extensionEl.value = previousExtension;
      if (sources.includes(previousSource as AssetSource)) this.sourceEl.value = previousSource;
    }

    private resetRenderWindow(): void {
      this.renderLimit = this.renderStep;
      this.applyFilters();
    }

    private applyFilters(): void {
      const query = this.searchEl.value.trim().toLowerCase();
      const extension = this.extensionEl.value;
      const source = this.sourceEl.value as AssetSource | "";
      const sort = this.sortEl.value;

      this.visible = this.registry.values().filter(item => {
        if (this.kind !== "all" && assetKind(item.extension) !== this.kind) return false;
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
        if (sort === "module") return b.modules.size - a.modules.size || a.name.localeCompare(b.name);
        return a.name.localeCompare(b.name);
      });

      this.renderKindCounts();
      this.renderCards();

      this.countEl.textContent = String(this.visible.length);
      this.selectedCountEl.textContent = String(this.selected.size);
      this.sourceCountEl.textContent = String(new Set(this.registry.values().flatMap(item => [...item.sources])).size);
      this.copySelectedButton.disabled = this.selected.size === 0;
      this.copySelectedButton.textContent = this.selected.size
        ? `Seçilenleri kopyala (${this.selected.size})`
        : "Seçilenleri kopyala";
    }

    private renderKindCounts(): void {
      const counts: Record<AssetKind | "all", number> = {
        all: 0,
        image: 0,
        video: 0,
        audio: 0,
        font: 0,
        code: 0,
        other: 0
      };

      for (const item of this.registry.values()) {
        counts.all++;
        counts[assetKind(item.extension)]++;
      }

      for (const [kind, count] of Object.entries(counts)) {
        const element = this.surface.querySelector<HTMLElement>(`[data-count-kind="${kind}"]`);
        if (element) element.textContent = String(count);
      }
    }

    private renderCards(): void {
      if (!this.visible.length) {
        this.grid.innerHTML = `
          <div class="empty">
            <strong>Varlık bulunamadı</strong>
            <span>Filtreleri değiştir veya yeniden tara.</span>
          </div>
        `;
        return;
      }

      const limit = Math.min(this.renderLimit, this.visible.length);
      const cards = this.visible.slice(0, limit).map(item => this.cardHtml(item)).join("");
      const remaining = this.visible.length - limit;

      this.grid.innerHTML = cards + (remaining > 0
        ? `<div class="load-more">
             <button data-action="load-more">Daha fazla göster (+${Math.min(this.renderStep, remaining)})</button>
             <span>${limit} / ${this.visible.length}</span>
           </div>`
        : "");
    }

    private cardHtml(item: AssetRecord): string {
      const selected = this.selected.has(item.url);
      const kind = assetKind(item.extension);
      const sources = [...item.sources].slice(0, 2);
      const sourceHtml = sources.map(source =>
        `<span class="source-chip">${escapeHtml(sourceLabel(source))}</span>`
      ).join("");

      return `
        <article class="card${selected ? " selected" : ""}" data-url="${escapeHtml(item.url)}">
          <div class="preview">
            ${this.previewHtml(item)}
            <div class="preview-meta">
              <span>${escapeHtml(assetKindLabel(kind))}</span>
              <span>${escapeHtml(item.extension.toUpperCase())}</span>
            </div>
            <button
              class="select"
              data-action="toggle-select"
              aria-label="${selected ? "Seçimi kaldır" : "Seç"}"
              aria-pressed="${selected}"
            >${selected ? "✓" : ""}</button>
          </div>

          <div class="card-body">
            <div class="filename" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</div>
            <div class="meta" title="${escapeHtml(item.url)}">
              <span>${escapeHtml(this.host(item.url))}</span>
              <span>•</span>
              <span>${item.modules.size ? `${item.modules.size} modül` : "yüklenmiş kaynak"}</span>
            </div>

            <div class="source-row">${sourceHtml}</div>

            <div class="card-actions">
              <button data-action="copy">Kopyala</button>
              <button data-action="open">Aç</button>
              <button class="download" data-action="download">İndir</button>
            </div>
          </div>
        </article>
      `;
    }

    private previewHtml(item: AssetRecord): string {
      const url = escapeHtml(item.url);

      if (IMAGE_EXTENSIONS.has(item.extension)) {
        return `<img loading="lazy" decoding="async" src="${url}" alt="" />`;
      }

      if (VIDEO_EXTENSIONS.has(item.extension)) {
        return `<video preload="metadata" muted src="${url}"></video>`;
      }

      if (AUDIO_EXTENSIONS.has(item.extension)) {
        return '<div class="file-preview"><b>♪</b><span>Ses</span></div>';
      }

      if (FONT_EXTENSIONS.has(item.extension)) {
        return '<div class="file-preview font-preview"><b>Aa</b><span>Yazı tipi</span></div>';
      }

      if (CODE_EXTENSIONS.has(item.extension)) {
        return `<div class="file-preview"><b>&lt;/&gt;</b><span>${escapeHtml(item.extension.toUpperCase())}</span></div>`;
      }

      return `<div class="file-preview"><b>FILE</b><span>${escapeHtml(item.extension.toUpperCase())}</span></div>`;
    }

    private host(url: string): string {
      try {
        return new URL(url, location.href).hostname.replace(/^cdn\./, "");
      } catch {
        return "discord";
      }
    }

    private async downloadAsset(url: string): Promise<void> {
      try {
        const response = await fetch(url, {
          method: "GET",
          cache: "force-cache",
          credentials: "same-origin",
          signal: this.abortController.signal
        });

        if (!response.ok) throw new Error(String(response.status));
        downloadBlob(await response.blob(), fileName(url));
        this.setStatus("İndirme hazırlandı.");
      } catch {
        if (!this.closed) window.open(url, "_blank", "noopener,noreferrer");
      }
    }

    private setStatus(text: string): void {
      this.statusEl.textContent = text;
    }

    private setProgress(value: number): void {
      this.progressEl.style.width = `${Math.max(0, Math.min(100, value))}%`;
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
