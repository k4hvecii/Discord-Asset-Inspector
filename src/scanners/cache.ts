namespace DAI {
  export async function scanCache(registry: AssetRegistry): Promise<ScanReport> {
    const before = registry.size();
    let count = 0;
    try {
      if (!("caches" in window)) return { added: 0, scannedResources: 0 };
      for (const name of await caches.keys()) {
        const cache = await caches.open(name);
        for (const request of await cache.keys()) {
          count++;
          registry.add(request.url, "cache");
        }
      }
    } catch {
      // Cache Storage availability differs between Discord builds.
    }
    return { added: registry.size() - before, scannedResources: count };
  }
}
