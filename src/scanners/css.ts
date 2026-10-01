namespace DAI {
  export function scanCss(registry: AssetRegistry): ScanReport {
    const before = registry.size();
    const urlRe = /url\(\s*["']?([^"')\s]+)["']?\s*\)/gi;
    let count = 0;

    const walk = (rules: CSSRuleList) => {
      for (const rule of Array.from(rules)) {
        count++;
        const nested = (rule as CSSGroupingRule).cssRules;
        if (nested) walk(nested);
        const text = rule.cssText || "";
        if (!text.includes("url(")) continue;
        urlRe.lastIndex = 0;
        let match: RegExpExecArray | null;
        while ((match = urlRe.exec(text))) registry.add(match[1], "css");
      }
    };

    for (const sheet of Array.from(document.styleSheets)) {
      try {
        if (sheet.cssRules) walk(sheet.cssRules);
      } catch {
        // Cross-origin stylesheets may not expose cssRules.
      }
    }

    return { added: registry.size() - before, scannedResources: count };
  }
}
