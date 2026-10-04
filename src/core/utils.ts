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
      webpack: "Webpack",
      "lazy-js": "Ek JS",
      "lazy-css": "Ek CSS",
      dom: "DOM",
      performance: "Ağ kaynakları",
      css: "CSS",
      cache: "Önbellek"
    };
    return labels[source];
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

  export function isUserContentAssetUrl(url: string): boolean {
    try {
      const parsed = new URL(url, location.href);
      const host = parsed.hostname.toLowerCase();
      const path = parsed.pathname.toLowerCase();

      if (!isDiscordOwnedUrl(parsed.href)) return false;

      const userPaths = [
        "/attachments/",
        "/avatars/",
        "/guilds/",
        "/icons/",
        "/banners/",
        "/splashes/",
        "/discovery-splashes/",
        "/emojis/",
        "/emoji/",
        "/twemoji/",
        "/emoji-sprites/",
        "/stickers/",
        "/sticker-packs/",
        "/role-icons/",
        "/app-icons/",
        "/app-assets/",
        "/team-icons/",
        "/channel-icons/",
        "/avatar-decorations/",
        "/avatar-decoration-presets/",
        "/profile-effects/",
        "/soundboard-sounds/",
        "/clan-badges/",
        "/guild-events/",
        "/guild-scheduled-events/"
      ];

      return userPaths.some(segment => path.includes(segment));
    } catch {
      return false;
    }
  }

  export function isLikelyNoiseAssetUrl(url: string): boolean {
    try {
      const parsed = new URL(url, location.href);
      const path = decodeURIComponent(parsed.pathname).toLowerCase();
      const name = (path.split("/").pop() || "").split(".")[0];

      if (isUserContentAssetUrl(parsed.href)) return true;

      const unicodeEmojiName =
        /^(?:emoji[_-]?)?(?:u[_+-]?)?[0-9a-f]{4,6}(?:[-_][0-9a-f]{2,6}){0,7}$/i.test(name);
      if (unicodeEmojiName) return true;

      return (
        /(?:^|[-_.])(twemoji|emoji-sprite|emoji_sprite|emoji-pack|emoji_pack)(?:[-_.]|$)/i.test(name) ||
        path.includes("/embed/avatars/") ||
        path.includes("/default-avatars/")
      );
    } catch {
      return false;
    }
  }

  export function isLikelyClientAssetUrl(url: string): boolean {
    if (url.startsWith("data:") || url.startsWith("blob:")) return false;

    try {
      const parsed = new URL(url, location.href);
      const path = parsed.pathname.toLowerCase();
      if (!isDiscordOwnedUrl(parsed.href)) return false;
      if (isUserContentAssetUrl(parsed.href)) return false;

      return (
        path.startsWith("/assets/") ||
        path === "/assets" ||
        path.includes("/assets/")
      );
    } catch {
      return false;
    }
  }

  export function shouldIncludeAsset(
    url: string,
    source: AssetSource,
    includeUserContent: boolean
  ): boolean {
    if (includeUserContent) return true;
    if (isLikelyNoiseAssetUrl(url)) return false;

    const runtimeOnlySources = new Set<AssetSource>(["dom", "performance", "cache", "css"]);
    if (!runtimeOnlySources.has(source)) return true;

    return isLikelyClientAssetUrl(url);
  }

  export function assetRegex(): RegExp {
    const ext = [...EXTENSIONS].join("|");
    return new RegExp(
      "(?:https?:\\\\?/\\\\?/[^\\\"'`\\\\\\s){}]+\\.(?:" + ext + ")(?=[?\\\"'`\\\\\\s){}]|$))|" +
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
