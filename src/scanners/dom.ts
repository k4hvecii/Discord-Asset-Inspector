namespace DAI {
  export function scanDom(registry: AssetRegistry): ScanReport {
    const before = registry.size();
    const elements = document.querySelectorAll<HTMLElement>("img,video,audio,source,link,script");
    for (const element of elements) {
      for (const attr of ["src", "href", "poster"] as const) {
        const value = element.getAttribute(attr);
        if (value) registry.add(value, "dom");
      }
    }
    return { added: registry.size() - before, scannedResources: elements.length };
  }
}
