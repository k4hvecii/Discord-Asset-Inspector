namespace DAI {
  export function escapeHtml(value: unknown): string {
    return String(value).replace(/[&<>"']/g, ch => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[ch] || ch));
  }

  export function fileName(url: string): string {
    try {
      const parsed = new URL(url, location.href);
      return decodeURIComponent(parsed.pathname.split("/").filter(Boolean).pop() || parsed.hostname);
    } catch {
      return url.split(/[?#]/)[0].split("/").pop() || url;
    }
  }

  export function getExtension(url: string): string {
    if (url.startsWith("data:")) {
      const match = url.match(/^data:[^/]+\/([a-z0-9+.-]+)/i);
      return (match?.[1] || "").toLowerCase().replace("svg+xml", "svg");
    }
    const clean = url.split(/[?#]/)[0];
    return (clean.match(/\.([a-z0-9]+)$/i)?.[1] || "").toLowerCase();
  }

  export function normalizeUrl(raw: string, runtime?: WebpackRuntime | null): string | null {
    let value = String(raw || "").trim().replace(/\\(?:\/|u002f)/gi, "/");
    value = value.replace(/^["'`]|["'`]$/g, "");
    if (!value || value.includes("${") || value.includes("#{")) return null;
    if (value.startsWith("data:") || value.startsWith("blob:")) return value;

    try {
      if (/^https?:\/\//i.test(value)) return new URL(value).href;
      if (value.startsWith("//")) return new URL(location.protocol + value).href;
      if (value.startsWith("/")) return new URL(value, location.origin).href;
      if (value.startsWith("assets/")) return new URL("/" + value, location.origin).href;
      if (/^[a-f0-9_-]{8,}\.[a-z0-9]+$/i.test(value)) return new URL("/assets/" + value, location.origin).href;
      if (runtime?.p) return new URL(value, runtime.p).href;
    } catch {
      return null;
    }
    return null;
  }

  export function isDiscordOwnedUrl(url: string): boolean {
    try {
      const host = new URL(url, location.href).hostname.toLowerCase();
      if (host === location.hostname.toLowerCase()) return true;
      return DISCORD_HOST_SUFFIXES.some(suffix => host === suffix || host.endsWith("." + suffix));
    } catch {
      return false;
    }
  }

  export function assetRegex(): RegExp {
    const ext = [...EXTENSIONS].join("|");
    return new RegExp(
      "(?:https?:\\\\?/\\\\?/[^\\\"'`\\\\\\s){}]+\\.(?:" + ext + ")(?=[?\\\"'`\\\\\\s){}]|$))|" +
      "(?:(?:\\\\?/?assets\\\\?/)?[a-fA-F0-9_-]{8,}\\.(?:" + ext + "))",
      "gi"
    );
  }

  export async function copyText(text: string): Promise<void> {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }

  export function downloadBlob(blob: Blob, name: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
  }

  export function saveJson(data: unknown, name: string): void {
    downloadBlob(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }), name);
  }

  export function debounce<T extends (...args: any[]) => void>(fn: T, wait: number): T {
    let timer = 0;
    return ((...args: Parameters<T>) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => fn(...args), wait);
    }) as T;
  }
}
