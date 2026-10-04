namespace DAI {
  export class InspectorApp {
    private root!: HTMLDivElement;
    private surface!: ShadowRoot;
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
    private copyFormatEl!: HTMLSelectElement;
    private copySelectedButton!: HTMLButtonElement;
    private selectedCountEl!: HTMLElement;
    private selectedOnlyButton!: HTMLButtonElement;
    private userContentButton!: HTMLButtonElement;
    private rawAssetsButton!: HTMLButtonElement;
    private visible: AssetRecord[] = [];
    private selected = new Set<string>();
    private kind: AssetKind | "all" = "all";
    private selectedOnly = false;
    private renderLimit = 60;
    private readonly renderStep = 60;
    private layoutRepairApplied = false;
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
      this.surface = this.root.attachShadow({ mode: "open" });
      this.surface.innerHTML = `
        <style>${STYLES}</style>
        <div class="dai-root">
        <div class="dai-backdrop"></div>
        <section class="dai-panel" role="dialog" aria-modal="true" aria-label="Discord Asset Inspector">
          <header class="dai-head">
            <div class="dai-brand"><div class="dai-title">Discord Asset Inspector</div><div class="dai-sub">v${VERSION} · yerel varlık inceleme aracı</div></div>
            <div class="dai-spacer"></div>
            <button class="dai-secondary" data-action="rescan">Yeniden Tara</button>
            <button class="dai-primary" data-action="lazy">Ek kaynakları tara</button>
            <button class="dai-secondary" data-action="json">JSON dışa aktar</button>
            <button class="dai-close" data-action="close" aria-label="Kapat">×</button>
          </header>
          <div class="dai-tools">
            <input data-role="search" placeholder="Dosya adı, URL, kaynak veya modül ara…" autocomplete="off" />
            <select data-role="extension"><option value="">Tüm uzantılar</option></select>
            <select data-role="source"><option value="">Tüm kaynaklar</option></select>
            <select data-role="sort"><option value="name">Ada göre</option><option value="extension">Uzantıya göre</option><option value="source">Kaynak sayısı</option><option value="module">Modül sayısı</option></select>
          </div>
          <div class="dai-kinds">
            <button class="is-active" data-action="kind" data-kind="all">Tümü <b data-kind-count="all">0</b></button>
            <button data-action="kind" data-kind="image">Görseller <b data-kind-count="image">0</b></button>
            <button data-action="kind" data-kind="video">Videolar <b data-kind-count="video">0</b></button>
            <button data-action="kind" data-kind="audio">Sesler <b data-kind-count="audio">0</b></button>
            <button data-action="kind" data-kind="font">Yazı tipleri <b data-kind-count="font">0</b></button>
            <button data-action="kind" data-kind="code">Kod & veri <b data-kind-count="code">0</b></button>
            <button data-action="kind" data-kind="other">Diğer <b data-kind-count="other">0</b></button>
          </div>
          <div class="dai-bulk">
            <button data-action="select-visible">Görünenleri seç</button>
            <button data-action="selected-only" aria-pressed="false">Yalnız seçilenler</button>
            <button data-action="clear-selection">Temizle</button>
            <button class="dai-content-toggle" data-action="user-content" aria-pressed="false">Kullanıcı içeriği: Kapalı</button>
            <button class="dai-raw-toggle" data-action="raw-assets" aria-pressed="false">Ham paket varlıkları: Kapalı</button>
            <span class="dai-spacer"></span>
            <select data-role="copy-format" aria-label="Kopyalama biçimi"><option value="url">URL</option><option value="markdown">Markdown</option><option value="css">CSS url()</option><option value="html">HTML</option></select>
            <button data-action="copy-selected" disabled>Seçilenleri kopyala</button>
          </div>
          <div class="dai-progress"><i data-role="progress"></i></div>
          <div class="dai-status"><span><strong data-role="count">0</strong> görünür</span><span><strong data-role="selected-count">0</strong> seçili</span><span><strong data-role="source-count">0</strong> kaynak türü</span><span data-role="status">Hazır</span></div>
          <div class="dai-grid" data-role="grid"></div>
        </section>
        </div>`;
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
      this.copyFormatEl = this.must<HTMLSelectElement>("[data-role=copy-format]");
      this.copySelectedButton = this.must<HTMLButtonElement>("[data-action=copy-selected]");
      this.selectedCountEl = this.must("[data-role=selected-count]");
      this.selectedOnlyButton = this.must<HTMLButtonElement>("[data-action=selected-only]");
      this.userContentButton = this.must<HTMLButtonElement>("[data-action=user-content]");
      this.rawAssetsButton = this.must<HTMLButtonElement>("[data-action=raw-assets]");

      const refresh = debounce(() => this.resetRenderWindow(), 120);
      this.searchEl.addEventListener("input", refresh);
      this.extensionEl.addEventListener("change", () => this.resetRenderWindow());
      this.sourceEl.addEventListener("change", () => this.resetRenderWindow());
      this.sortEl.addEventListener("change", () => this.resetRenderWindow());

      this.surface.addEventListener("click", event => this.handleClick(event));
      this.surface.querySelector(".dai-backdrop")?.addEventListener("click", () => this.close());
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
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>("button[data-action]");
      if (!button) return;
      const action = button.dataset.action;

      if (action === "close") return this.close();
      if (action === "rescan") return void this.rescan();
      if (action === "lazy") return void this.scanLazy();
      if (action === "json") return saveJson(this.registry.serialize(), `discord-assets-${Date.now()}.json`);
      if (action === "kind") {
        this.kind = (button.dataset.kind || "all") as AssetKind | "all";
        this.surface.querySelectorAll(".dai-kinds button").forEach(el => el.classList.toggle("is-active", el === button));
        this.resetRenderWindow();
        return;
      }
      if (action === "select-visible") {
        this.visible.forEach(item => this.selected.add(item.url));
        this.applyFilters();
        return;
      }
      if (action === "clear-selection") {
        this.selected.clear();
        this.applyFilters();
        return;
      }
      if (action === "selected-only") {
        this.selectedOnly = !this.selectedOnly;
        this.selectedOnlyButton.setAttribute("aria-pressed", String(this.selectedOnly));
        this.selectedOnlyButton.classList.toggle("is-active", this.selectedOnly);
        this.applyFilters();
        return;
      }
      if (action === "user-content") {
        const enabled = !this.registry.isUserContentEnabled();
        this.registry.setIncludeUserContent(enabled);
        this.userContentButton.setAttribute("aria-pressed", String(enabled));
        this.userContentButton.classList.toggle("is-active", enabled);
        this.userContentButton.textContent = `Kullanıcı içeriği: ${enabled ? "Açık" : "Kapalı"}`;
        await this.rescan();
        return;
      }
      if (action === "raw-assets") {
        const enabled = !this.webpack.isRawAssetModulesEnabled();
        this.webpack.setIncludeRawAssetModules(enabled);
        this.rawAssetsButton.setAttribute("aria-pressed", String(enabled));
        this.rawAssetsButton.classList.toggle("is-active", enabled);
        this.rawAssetsButton.textContent = `Ham paket varlıkları: ${enabled ? "Açık" : "Kapalı"}`;
        await this.rescan();
        return;
      }
      if (action === "load-more") {
        this.renderLimit += this.renderStep;
        this.renderCards();
        return;
      }
      if (action === "copy-selected") {
        const items = this.registry.values().filter(item => this.selected.has(item.url));
        if (!items.length) return;
        const format = this.copyFormatEl.value as CopyFormat;
        await copyText(items.map(item => formatCopy(item, format)).join("\n"));
        this.setStatus(`${items.length} seçili varlık kopyalandı.`);
        return;
      }

      const card = button.closest<HTMLElement>(".dai-card");
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
      } else if (action === "open") {
        window.open(url, "_blank", "noopener,noreferrer");
      } else if (action === "download") {
        await this.downloadAsset(url);
      }
    }

    async rescan(): Promise<void> {
      if (this.closed) return;

      this.setStatus("Temiz tarama başlatılıyor…");
      this.registry.clear();
      this.selected.clear();
      this.renderLimit = this.renderStep;
      this.layoutRepairApplied = false;

      this.webpack.connect();
      const reports: ScanReport[] = [
        this.webpack.scanLoadedModules(),
        scanDom(this.registry),
        scanCss(this.registry)
      ];

      if (this.registry.isUserContentEnabled()) {
        reports.push(scanPerformance(this.registry));
      }

      this.rebuildFilters();
      this.applyFilters();
      const scanned = reports.reduce((sum, report) => sum + (report.scannedResources || 0) + (report.scannedModules || 0), 0);
      const skipped = reports.reduce((sum, report) => sum + (report.skippedAssets || 0), 0);
      this.setStatus(
        `Tarama tamamlandı · ${this.registry.size()} temiz varlık · ${skipped} gereksiz varlık filtrelendi · ${scanned} kaynak incelendi.`
      );
    }

    private async scanLazy(): Promise<void> {
      if (this.closed || this.lazyButton.disabled) return;
      this.lazyButton.disabled = true;
      this.setStatus("Ek Discord kaynakları taranıyor…");
      this.setProgress(0);
      try {
        const report = await this.webpack.scanLazyResources(this.abortController.signal, (done, total) => {
          this.setProgress(total ? (done / total) * 100 : 0);
          this.setStatus(`Ek tarama ${done}/${total}…`);
        });
        this.rebuildFilters();
        this.applyFilters();
        this.setStatus(`Ek tarama tamamlandı · ${report.added} yeni varlık · ${report.failedResources || 0} başarısız.`);
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
      this.extensionEl.innerHTML = `<option value="">Tüm uzantılar</option>${extensions.map(x => `<option value="${escapeHtml(x)}">${escapeHtml(x.toUpperCase())}</option>`).join("")}`;
      this.sourceEl.innerHTML = `<option value="">Tüm kaynaklar</option>${sources.map(x => `<option value="${escapeHtml(x)}">${escapeHtml(sourceLabel(x as AssetSource))}</option>`).join("")}`;
      if (extensions.includes(extension)) this.extensionEl.value = extension;
      if (sources.includes(source as AssetSource)) this.sourceEl.value = source;
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
        if (this.selectedOnly && !this.selected.has(item.url)) return false;
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

      this.renderCards();
      this.renderKindCounts();
      this.countEl.textContent = String(this.visible.length);
      this.selectedCountEl.textContent = String(this.selected.size);
      this.sourceCountEl.textContent = String(new Set(this.registry.values().flatMap(item => [...item.sources])).size);
      this.copySelectedButton.disabled = this.selected.size === 0;
      this.copySelectedButton.textContent = this.selected.size ? `Seçilenleri kopyala (${this.selected.size})` : "Seçilenleri kopyala";
    }

    private renderKindCounts(): void {
      const counts: Record<AssetKind | "all", number> = { all: 0, image: 0, video: 0, audio: 0, font: 0, code: 0, other: 0 };
      for (const item of this.registry.values()) {
        counts.all++;
        counts[assetKind(item.extension)]++;
      }
      for (const [kind, count] of Object.entries(counts)) {
        const element = this.surface.querySelector<HTMLElement>(`[data-kind-count="${kind}"]`);
        if (element) element.textContent = String(count);
      }
    }

    private renderCards(): void {
      if (!this.visible.length) {
        this.grid.innerHTML = `<div class="dai-empty">Geçerli filtrelerle eşleşen varlık bulunamadı.</div>`;
        return;
      }

      const limit = Math.min(this.renderLimit, this.visible.length);
      const html = this.visible.slice(0, limit).map(item => {
        const preview = this.previewHtml(item);
        const selected = this.selected.has(item.url);
        const kind = assetKind(item.extension);
        const host = this.urlHost(item.url);
        const chips = [...item.sources].slice(0, 2).map(source => `<span class="dai-chip">${escapeHtml(sourceLabel(source))}</span>`).join("");
        const extraSources = Math.max(0, item.sources.size - 2);

        return `<article class="dai-card${selected ? " is-selected" : ""}" data-url="${escapeHtml(item.url)}">
          <div class="dai-preview">
            ${preview}
            <div class="dai-preview-top">
              <div class="dai-badges">
                <span class="dai-kind-badge">${escapeHtml(assetKindLabel(kind))}</span>
                <span class="dai-ext-badge">${escapeHtml((item.extension || "dosya").toUpperCase())}</span>
              </div>
              <button class="dai-select" data-action="toggle-select" aria-label="${selected ? "Seçimi kaldır" : "Seç"}" aria-pressed="${selected}">
                <span>${selected ? "✓" : ""}</span>
              </button>
            </div>
          </div>
          <div class="dai-body">
            <div class="dai-name" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</div>
            <div class="dai-location" title="${escapeHtml(item.url)}">
              <span class="dai-host">${escapeHtml(host)}</span>
              <span class="dai-dot">•</span>
              <span>${item.modules.size ? `${item.modules.size} modül` : "modül yok"}</span>
            </div>
            <div class="dai-footer">
              <div class="dai-chips">${chips}${extraSources ? `<span class="dai-chip">+${extraSources}</span>` : ""}</div>
              <div class="dai-actions">
                <button data-action="copy" title="Kopyala" aria-label="Kopyala">Kopyala</button>
                <button data-action="open" title="Yeni sekmede aç" aria-label="Aç">Aç</button>
                <button class="dai-download" data-action="download" title="İndir" aria-label="İndir">İndir</button>
              </div>
            </div>
          </div>
        </article>`;
      }).join("");

      const remaining = Math.max(0, this.visible.length - limit);
      this.grid.innerHTML = html + (remaining
        ? `<div class="dai-load-more"><button data-action="load-more">Daha fazla göster <span>+${Math.min(this.renderStep, remaining)}</span></button><small>${limit} / ${this.visible.length} gösteriliyor</small></div>`
        : "");
      this.scheduleLayoutCheck();
    }

    private scheduleLayoutCheck(): void {
      requestAnimationFrame(() => {
        if (this.closed) return;
        const card = this.grid.querySelector<HTMLElement>(".dai-card");
        const preview = card?.querySelector<HTMLElement>(".dai-preview");
        if (!card || !preview) return;

        const gridStyle = getComputedStyle(this.grid);
        const cardRect = card.getBoundingClientRect();
        const previewRect = preview.getBoundingClientRect();

        const broken =
          gridStyle.display !== "grid" ||
          cardRect.width < 150 ||
          cardRect.height < 150 ||
          previewRect.height < 70;

        if (broken) this.applyCriticalLayoutFallback();
      });
    }

    private applyCriticalLayoutFallback(): void {
      const firstRepair = !this.layoutRepairApplied;
      this.layoutRepairApplied = true;

      Object.assign(this.grid.style, {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
        alignContent: "start",
        gap: "12px",
        padding: "14px 18px 20px",
        overflow: "auto"
      });

      this.grid.querySelectorAll<HTMLElement>(".dai-card").forEach(card => {
        Object.assign(card.style, {
          display: "block",
          minWidth: "0",
          minHeight: "235px",
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,.09)",
          borderRadius: "13px",
          background: "#1c1f25"
        });
        const preview = card.querySelector<HTMLElement>(".dai-preview");
        if (preview) {
          Object.assign(preview.style, {
            position: "relative",
            display: "grid",
            placeItems: "center",
            width: "100%",
            height: "145px",
            minHeight: "145px",
            overflow: "hidden",
            background: "#111318"
          });
        }
        const body = card.querySelector<HTMLElement>(".dai-body");
        if (body) {
          Object.assign(body.style, {
            display: "block",
            minHeight: "88px",
            padding: "11px"
          });
        }
      });

      if (firstRepair) this.setStatus("Görünüm koruması etkinleştirildi.");
    }

    private urlHost(url: string): string {
      try {
        return new URL(url, location.href).hostname.replace(/^cdn\./, "");
      } catch {
        return "yerel kaynak";
      }
    }

    private previewHtml(item: AssetRecord): string {
      const url = escapeHtml(item.url);
      if (IMAGE_EXTENSIONS.has(item.extension)) return `<img loading="lazy" decoding="async" src="${url}" alt="" />`;
      if (VIDEO_EXTENSIONS.has(item.extension)) return `<video preload="metadata" muted src="${url}"></video>`;
      if (AUDIO_EXTENSIONS.has(item.extension)) return `<div class="dai-filetype"><b>WAVE</b><span>Ses</span></div>`;
      if (FONT_EXTENSIONS.has(item.extension)) return `<div class="dai-fonttype"><b>Aa</b><span>Yazı tipi</span></div>`;
      if (CODE_EXTENSIONS.has(item.extension)) return `<div class="dai-filetype"><b>&lt;/&gt;</b><span>${escapeHtml(item.extension || "Kod")}</span></div>`;
      return `<div class="dai-filetype"><b>FILE</b><span>${escapeHtml(item.extension || "Diğer")}</span></div>`;
    }

    private async downloadAsset(url: string): Promise<void> {
      try {
        const response = await fetch(url, { method: "GET", cache: "force-cache", signal: this.abortController.signal });
        if (!response.ok) throw new Error(String(response.status));
        downloadBlob(await response.blob(), fileName(url));
        this.setStatus("İndirme hazırlandı.");
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
