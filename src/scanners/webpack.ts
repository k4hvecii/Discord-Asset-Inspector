namespace DAI {
  declare const webpackChunkdiscord_app: any;

  export class WebpackScanner {
    readonly chunkIds = new Set<string>();
    runtime: WebpackRuntime | null = null;
    private readonly parsedModules = new WeakMap<Function, { assets: string[]; chunks: string[] }>();

    constructor(private readonly registry: AssetRegistry) {}

    connect(): WebpackRuntime | null {
      try {
        if (typeof webpackChunkdiscord_app === "undefined" || !webpackChunkdiscord_app?.push) return null;

        let runtime: WebpackRuntime | null = null;
        const marker = Symbol("discord_asset_inspector");
        webpackChunkdiscord_app.push([[marker], {}, (r: WebpackRuntime) => { runtime = r; }]);
        webpackChunkdiscord_app.pop();

        this.runtime = runtime;
        this.registry.setRuntime(runtime);
        return runtime;
      } catch {
        return null;
      }
    }

    scanLoadedModules(): ScanReport {
      const before = this.registry.size();
      const modules = this.runtime?.m;
      if (!modules) return { added: 0, scannedModules: 0, discoveredChunks: 0, skippedAssets: 0 };

      this.chunkIds.clear();
      const assetRe = assetRegex();
      const chunkRe = /\.e\(\s*["']?([\w$-]+)["']?\s*\)/g;
      let scannedModules = 0;
      let skippedAssets = 0;

      for (const [id, factory] of Object.entries(modules)) {
        let parsed = this.parsedModules.get(factory);

        if (!parsed) {
          let code = "";
          try {
            code = factory.toString();
          } catch {
            continue;
          }

          assetRe.lastIndex = 0;
          const assets: string[] = [];
          let match: RegExpExecArray | null;
          while ((match = assetRe.exec(code))) assets.push(match[0]);

          chunkRe.lastIndex = 0;
          const chunks: string[] = [];
          while ((match = chunkRe.exec(code))) chunks.push(match[1]);

          parsed = { assets, chunks };
          this.parsedModules.set(factory, parsed);
        }

        scannedModules++;
        parsed.chunks.forEach(chunk => this.chunkIds.add(chunk));

        for (const raw of parsed.assets) {
          const normalized = normalizeUrl(raw, this.runtime);
          if (!normalized || !isStaticClientAssetUrl(normalized)) {
            skippedAssets++;
            continue;
          }

          const extension = getExtension(normalized);

          // Görselleri Webpack modül haritasından körlemesine eklemiyoruz.
          // Emoji/flag/illustration kataloglarının büyük kısmı burada tutuluyor.
          // Gerçekten yüklenmiş görseller Performance/CSS taramalarından gelir.
          if (IMAGE_EXTENSIONS.has(extension)) {
            skippedAssets++;
            continue;
          }

          this.registry.add(normalized, "webpack", id);
        }
      }

      return {
        added: this.registry.size() - before,
        scannedModules,
        discoveredChunks: this.chunkIds.size,
        skippedAssets
      };
    }

    private resolveResource(id: string, kind: "js" | "css"): string | null {
      try {
        const resolver = kind === "js" ? this.runtime?.u : this.runtime?.miniCssF;
        if (!resolver) return null;

        const relative = resolver(id);
        if (!relative) return null;

        const base = this.runtime?.p || location.origin + "/";
        const url = new URL(relative, base).href;
        return isStaticClientAssetUrl(url) ? url : null;
      } catch {
        return null;
      }
    }

    async scanLazyResources(
      signal: AbortSignal,
      onProgress?: (done: number, total: number) => void
    ): Promise<ScanReport> {
      const before = this.registry.size();
      const queue: Array<{ url: string; source: "lazy-js" | "lazy-css" }> = [];
      const seen = new Set<string>();

      for (const id of this.chunkIds) {
        const js = this.resolveResource(id, "js");
        const css = this.resolveResource(id, "css");
        if (js) queue.push({ url: js, source: "lazy-js" });
        if (css) queue.push({ url: css, source: "lazy-css" });
      }

      const unique = queue.filter(item => {
        if (seen.has(item.url)) return false;
        seen.add(item.url);
        return true;
      }).slice(0, 300);

      let cursor = 0;
      let done = 0;
      let failed = 0;
      let skippedAssets = 0;
      const workers = Math.min(3, Math.max(1, unique.length));
      const assetRe = assetRegex();

      const worker = async () => {
        while (cursor < unique.length && !signal.aborted) {
          const item = unique[cursor++];

          try {
            const response = await fetch(item.url, {
              method: "GET",
              cache: "force-cache",
              credentials: "same-origin",
              signal
            });

            if (!response.ok) throw new Error(String(response.status));
            const text = await response.text();

            assetRe.lastIndex = 0;
            let match: RegExpExecArray | null;
            while ((match = assetRe.exec(text))) {
              const normalized = normalizeUrl(match[0], this.runtime);
              if (!normalized || !isStaticClientAssetUrl(normalized)) {
                skippedAssets++;
                continue;
              }

              const extension = getExtension(normalized);
              const image = IMAGE_EXTENSIONS.has(extension);

              // JS chunk içindeki ham image kataloglarını almıyoruz.
              // CSS chunk içindeki image URL'leri stil tarafından gerçekten referanslandığı için güvenilir.
              if (image && item.source !== "lazy-css") {
                skippedAssets++;
                continue;
              }

              this.registry.add(normalized, item.source);
            }
          } catch {
            if (!signal.aborted) failed++;
          } finally {
            done++;
            onProgress?.(done, unique.length);
          }
        }
      };

      await Promise.all(Array.from({ length: workers }, worker));

      return {
        added: this.registry.size() - before,
        scannedResources: done,
        failedResources: failed,
        discoveredChunks: this.chunkIds.size,
        skippedAssets
      };
    }
  }
}
