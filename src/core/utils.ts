namespace DAI {
  export function escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[char] || char);
  }

  export function fileName(url: string): string {
    try {
      const parsed = new URL(url, location.href);
      return decodeURIComponent(parsed.pathname.split("/").pop() || "asset");
    } catch {
      return "asset";
    }
  }

  export function getExtension(url: string): string {
    const clean = url.split(/[?#]/)[0];
    return (clean.match(/\.([a-z0-9]+)$/i)?.[1] || "").toLowerCase();
  }

  export function assetKind(extension: string): AssetKind {
    if (IMAGE_EXTENSIONS.has(extension)) return "image";
    if (VIDEO_EXTENSIONS.has(extension)) return "video";
    if (AUDIO_EXTENSIONS.has(extension)) return "audio";
    if (FONT_EXTENSIONS.has(extension)) return "font";
    if (CODE_EXTENSIONS.has(extension)) return "code";
    return "other";
  }

  export function assetKindLabel(kind: AssetKind): string {
    const labels: Record<AssetKind, string> = {
      image: "Görsel",
      video: "Video",
      audio: "Ses",
      font: "Yazı tipi",
      code: "Kod & veri",
      other: "Diğer"
    };
    return labels[kind];
  }

  export function sourceLabel(source: AssetSource): string {
    const labels: Record<AssetSource, string> = {
      performance: "Yüklü kaynak",
      css: "CSS",
      webpack: "Webpack",
      "lazy-js": "Ek JS",
      "lazy-css": "Ek CSS"
    };
    return labels[source];
  }

  export function normalizeUrl(raw: string, runtime?: WebpackRuntime | null): string | null {
    let value = String(raw || "").trim().replace(/\\(?:\/|u002f)/gi, "/");
    value = value.replace(/^[\"'\x60]|[\"'\x60]$/g, "");
    if (!value || value.includes("${") || value.includes("#{")) return null;

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

  export function isStaticClientAssetUrl(url: string): boolean {
    try {
      const parsed = new URL(url, location.href);
      if (!isDiscordOwnedUrl(parsed.href)) return false;

      const path = parsed.pathname.toLowerCase();
      if (!(path === "/assets" || path.startsWith("/assets/") || path.includes("/assets/"))) return false;

      const blocked = [
        "/attachments/", "/avatars/", "/guilds/", "/banners/", "/emojis/",
        "/stickers/", "/role-icons/", "/app-icons/", "/avatar-decorations/",
        "/profile-effects/", "/soundboard-sounds/"
      ];
      return !blocked.some(segment => path.includes(segment));
    } catch {
      return false;
    }
  }

  export function assetRegex(): RegExp {
    const ext = [...EXTENSIONS].join("|");
    return new RegExp(
      "(?:https?:\\\\?/\\\\?/[^\\\"'\\x60\\\\\\s){}]+\\.(?:" + ext + ")(?=[?\\\"'\\x60\\\\\\s){}]|$))|" +
      "(?:(?:\\\\?/?assets\\\\?/)?[a-fA-F0-9_-]{8,}\\.(?:" + ext + "))",
      "gi"
    );
  }

  export function formatCopy(item: AssetRecord, format: CopyFormat): string {
    const name = item.name || "asset";
    if (format === "markdown") {
      return assetKind(item.extension) === "image" ? `![${name}](${item.url})` : `[${name}](${item.url})`;
    }
    if (format === "css") return `url(${JSON.stringify(item.url)})`;
    if (format === "html") {
      return assetKind(item.extension) === "image"
        ? `<img src="${escapeHtml(item.url)}" alt="${escapeHtml(name)}">`
        : `<a href="${escapeHtml(item.url)}">${escapeHtml(name)}</a>`;
    }
    return item.url;
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
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = name;
    anchor.rel = "noopener";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
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
