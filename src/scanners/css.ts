namespace DAI {
  export function scanCss(registry: AssetRegistry): ScanReport {
    const before = registry.size();
    const urlRe = /url\(\s*["']?([^"')\s]+)["']?\s*\)/gi;
    let scanned = 0;

    const walk = (rules: CSSRuleList) => {
      for (const rule of Array.from(rules)) {
        const nested = (rule as CSSGroupingRule).cssRules;
        if (nested) walk(nested);

        const text = rule.cssText || "";
        if (!text.includes("url(")) continue;

        urlRe.lastIndex = 0;
        let match: RegExpExecArray | null;
        while ((match = urlRe.exec(text))) {
          const normalized = normalizeUrl(match[1]);
          if (!normalized || !isStaticClientAssetUrl(normalized)) continue;
          scanned++;
          registry.add(normalized, "css");
        }
      }
    };

    for (const sheet of Array.from(document.styleSheets)) {
      try {
        if (sheet.cssRules) walk(sheet.cssRules);
      } catch {
        // Cross-origin stylesheets are intentionally ignored.
      }
    }

    return { added: registry.size() - before, scannedResources: scanned };
  }
}
