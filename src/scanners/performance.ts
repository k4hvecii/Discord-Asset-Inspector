namespace DAI {
  export function scanPerformance(registry: AssetRegistry): ScanReport {
    const before = registry.size();
    const entries = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
    let scanned = 0;

    for (const entry of entries) {
      if (!isStaticClientAssetUrl(entry.name)) continue;
      scanned++;
      registry.add(entry.name, "performance");
    }

    return { added: registry.size() - before, scannedResources: scanned };
  }
}
