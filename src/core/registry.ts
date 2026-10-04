namespace DAI {
  export class AssetRegistry {
    private readonly items = new Map<string, AssetRecord>();
    private includeUserContent = false;

    constructor(private runtime: WebpackRuntime | null = null) {}

    setIncludeUserContent(value: boolean): number {
      this.includeUserContent = value;
      if (value) return 0;

      let removed = 0;
      for (const [url, item] of this.items) {
        const keep = [...item.sources].some(source => shouldIncludeAsset(url, source, false));
        if (!keep) {
          this.items.delete(url);
          removed++;
        }
      }
      return removed;
    }

    isUserContentEnabled(): boolean {
      return this.includeUserContent;
    }

    setRuntime(runtime: WebpackRuntime | null): void {
      this.runtime = runtime;
    }

    add(raw: string, source: AssetSource, moduleId?: string): boolean {
      const url = normalizeUrl(raw, this.runtime);
      if (!url || url.endsWith("/")) return false;
      if (!shouldIncludeAsset(url, source, this.includeUserContent)) return false;

      let extension = getExtension(url);
      if (!extension && /(?:cdn\.discordapp\.com|media\.discordapp\.net)/i.test(url)) {
        extension = "webp";
      }

      if (!EXTENSIONS.has(extension) && !url.startsWith("data:") && !url.startsWith("blob:")) return false;

      const existing = this.items.get(url);
      if (existing) {
        existing.sources.add(source);
        if (moduleId) existing.modules.add(moduleId);
        return false;
      }

      this.items.set(url, {
        url,
        name: fileName(url),
        extension,
        sources: new Set([source]),
        modules: new Set(moduleId ? [moduleId] : [])
      });
      return true;
    }

    get(url: string): AssetRecord | undefined {
      return this.items.get(url);
    }

    size(): number {
      return this.items.size;
    }

    values(): AssetRecord[] {
      return [...this.items.values()];
    }

    serialize(): SerializedAsset[] {
      return this.values().map(item => ({
        url: item.url,
        name: item.name,
        extension: item.extension,
        kind: assetKind(item.extension),
        sources: [...item.sources],
        modules: [...item.modules]
      }));
    }
  }
}
