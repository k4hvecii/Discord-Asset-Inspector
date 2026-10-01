namespace DAI {
  export function scanPerformance(registry: AssetRegistry): ScanReport {
    const before = registry.size();
    const entries = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
    for (const entry of entries) registry.add(entry.name, "performance");
    return { added: registry.size() - before, scannedResources: entries.length };
  }
}
