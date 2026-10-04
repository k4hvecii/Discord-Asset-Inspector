namespace DAI {
  declare const webpackChunkdiscord_app: any;

  export class WebpackScanner {
    readonly chunkIds = new Set<string>();
    runtime: WebpackRuntime | null = null;
    private readonly moduleCache = new WeakMap<Function, {
      assets: string[];
      chunks: string[];
      imageAssetCount: number;
      emojiLike: boolean;
      avatarLike: boolean;
      stickerLike: boolean;
      profileLike: boolean;
    }>();

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
      if (!modules) return { added: 0, scannedModules: 0, discoveredChunks: 0 };

      this.chunkIds.clear();
      const assetRe = assetRegex();
      const chunkRe = /\.e\(\s*["']?([\w$-]+)["']?\s*\)/g;
      let scanned = 0;

      for (const [id, factory] of Object.entries(modules)) {
        let parsed = this.moduleCache.get(factory);

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

          const imageAssetCount = assets.reduce((count, raw) => {
            const normalized = normalizeUrl(raw, this.runtime);
            return normalized && IMAGE_EXTENSIONS.has(getExtension(normalized)) ? count + 1 : count;
          }, 0);

          parsed = {
            assets,
            chunks,
            imageAssetCount,
            emojiLike: /(emoji|twemoji|unicode.?emoji|emoji.?picker|emoji.?asset|emoji.?sprite|emojiname)/i.test(code),
            avatarLike: /(default.?avatar|avatar.?asset|default.?profile|embed.?avatar)/i.test(code),
            stickerLike: /(sticker|sticker.?pack|sticker.?asset)/i.test(code),
            profileLike: /(profile.?effect|avatar.?decoration|profile.?decoration|collectibles?)/i.test(code)
          };
          this.moduleCache.set(factory, parsed);
        }

        scanned++;
        parsed.chunks.forEach(chunkId => this.chunkIds.add(chunkId));

        const broadMode = this.registry.isUserContentEnabled();
        const noisyEmojiModule = !broadMode && parsed.emojiLike && parsed.imageAssetCount >= 3;
        const noisyAvatarModule = !broadMode && parsed.avatarLike && parsed.imageAssetCount >= 2;
        const denseImageCatalog = !broadMode && parsed.imageAssetCount >= 64;

        for (const raw of parsed.assets) {
          const normalized = normalizeUrl(raw, this.runtime);
          const extension = normalized ? getExtension(normalized) : "";
          const image = IMAGE_EXTENSIONS.has(extension);
          const rasterImage = image && extension !== "svg";
          const contextualNoise =
            !broadMode &&
            rasterImage &&
            (parsed.emojiLike || parsed.avatarLike || parsed.stickerLike || parsed.profileLike);

          if (image && (noisyEmojiModule || noisyAvatarModule || denseImageCatalog || contextualNoise)) continue;
          this.registry.add(raw, "webpack", id);
        }
      }

      return {
        added: this.registry.size() - before,
        scannedModules: scanned,
        discoveredChunks: this.chunkIds.size
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
        return isDiscordOwnedUrl(url) ? url : null;
      } catch {
        return null;
      }
    }

    async scanLazyResources(signal: AbortSignal, onProgress?: (done: number, total: number) => void): Promise<ScanReport> {
      const before = this.registry.size();
      const queue: Array<{ url: string; source: AssetSource }> = [];
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
      }).slice(0, 500);

      let next = 0;
      let done = 0;
      let failed = 0;
      const assetRe = assetRegex();
      const workers = Math.min(4, unique.length || 1);

      const worker = async () => {
        while (next < unique.length && !signal.aborted) {
          const item = unique[next++];
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
            const assets: string[] = [];
            let match: RegExpExecArray | null;
            while ((match = assetRe.exec(text))) assets.push(match[0]);

            const broadMode = this.registry.isUserContentEnabled();
            const imageAssetCount = assets.reduce((count, raw) => {
              const normalized = normalizeUrl(raw, this.runtime);
              return normalized && IMAGE_EXTENSIONS.has(getExtension(normalized)) ? count + 1 : count;
            }, 0);
            const emojiHeavy =
              !broadMode &&
              imageAssetCount >= 24 &&
              /(emoji|twemoji|unicode.?emoji|emoji.?asset|emoji.?sprite)/i.test(text);
            const avatarHeavy =
              !broadMode &&
              imageAssetCount >= 8 &&
              /(default.?avatar|avatar.?asset|default.?profile)/i.test(text);

            for (const raw of assets) {
              const normalized = normalizeUrl(raw, this.runtime);
              const image = Boolean(normalized && IMAGE_EXTENSIONS.has(getExtension(normalized)));
              if (image && (emojiHeavy || avatarHeavy)) continue;
              this.registry.add(raw, item.source);
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
        discoveredChunks: this.chunkIds.size
      };
    }
  }
}
