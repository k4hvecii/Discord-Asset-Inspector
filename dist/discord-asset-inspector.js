"use strict";
var DAI;
(function (DAI) {
    DAI.VERSION = "0.4.1";
    DAI.ROOT_ID = "__discord_asset_inspector__";
    DAI.EXTENSIONS = new Set([
        "png", "jpg", "jpeg", "webp", "gif", "apng", "avif", "bmp", "svg", "ico", "tiff",
        "mp4", "webm", "mov", "m4v", "ogv", "mkv", "m3u8",
        "mp3", "ogg", "wav", "m4a", "aac", "flac", "opus", "weba",
        "woff", "woff2", "ttf", "otf", "eot", "ttc",
        "json", "wasm", "css", "js", "xml", "txt", "webmanifest", "lottie", "rlottie",
        "pdf", "vtt", "glsl", "rive"
    ]);
    DAI.IMAGE_EXTENSIONS = new Set([
        "png", "jpg", "jpeg", "webp", "gif", "apng", "avif", "bmp", "svg", "ico", "tiff"
    ]);
    DAI.VIDEO_EXTENSIONS = new Set(["mp4", "webm", "mov", "m4v", "ogv"]);
    DAI.AUDIO_EXTENSIONS = new Set(["mp3", "ogg", "wav", "m4a", "aac", "flac", "opus", "weba"]);
    DAI.FONT_EXTENSIONS = new Set(["woff", "woff2", "ttf", "otf", "eot", "ttc"]);
    DAI.CODE_EXTENSIONS = new Set(["json", "wasm", "css", "js", "xml", "txt", "webmanifest", "lottie", "rlottie", "vtt", "glsl"]);
    DAI.DISCORD_HOST_SUFFIXES = [
        "discord.com",
        "discordapp.com",
        "discordapp.net",
        "discord.media"
    ];
})(DAI || (DAI = {}));
var DAI;
(function (DAI) {
    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, ch => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        }[ch] || ch));
    }
    DAI.escapeHtml = escapeHtml;
    function fileName(url) {
        try {
            const parsed = new URL(url, location.href);
            return decodeURIComponent(parsed.pathname.split("/").filter(Boolean).pop() || parsed.hostname);
        }
        catch {
            return url.split(/[?#]/)[0].split("/").pop() || url;
        }
    }
    DAI.fileName = fileName;
    function getExtension(url) {
        if (url.startsWith("data:")) {
            const match = url.match(/^data:[^/]+\/([a-z0-9+.-]+)/i);
            return (match?.[1] || "").toLowerCase().replace("svg+xml", "svg");
        }
        const clean = url.split(/[?#]/)[0];
        return (clean.match(/\.([a-z0-9]+)$/i)?.[1] || "").toLowerCase();
    }
    DAI.getExtension = getExtension;
    function assetKind(extension) {
        if (DAI.IMAGE_EXTENSIONS.has(extension))
            return "image";
        if (DAI.VIDEO_EXTENSIONS.has(extension))
            return "video";
        if (DAI.AUDIO_EXTENSIONS.has(extension))
            return "audio";
        if (DAI.FONT_EXTENSIONS.has(extension))
            return "font";
        if (DAI.CODE_EXTENSIONS.has(extension))
            return "code";
        return "other";
    }
    DAI.assetKind = assetKind;
    function assetKindLabel(kind) {
        const labels = {
            image: "Görsel",
            video: "Video",
            audio: "Ses",
            font: "Yazı tipi",
            code: "Kod & veri",
            other: "Diğer"
        };
        return labels[kind];
    }
    DAI.assetKindLabel = assetKindLabel;
    function sourceLabel(source) {
        const labels = {
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
    DAI.sourceLabel = sourceLabel;
    function normalizeUrl(raw, runtime) {
        let value = String(raw || "").trim().replace(/\\(?:\/|u002f)/gi, "/");
        value = value.replace(/^["'`]|["'`]$/g, "");
        if (!value || value.includes("${") || value.includes("#{"))
            return null;
        if (value.startsWith("data:") || value.startsWith("blob:"))
            return value;
        try {
            if (/^https?:\/\//i.test(value))
                return new URL(value).href;
            if (value.startsWith("//"))
                return new URL(location.protocol + value).href;
            if (value.startsWith("/"))
                return new URL(value, location.origin).href;
            if (value.startsWith("assets/"))
                return new URL("/" + value, location.origin).href;
            if (/^[a-f0-9_-]{8,}\.[a-z0-9]+$/i.test(value))
                return new URL("/assets/" + value, location.origin).href;
            if (runtime?.p)
                return new URL(value, runtime.p).href;
        }
        catch {
            return null;
        }
        return null;
    }
    DAI.normalizeUrl = normalizeUrl;
    function isDiscordOwnedUrl(url) {
        try {
            const host = new URL(url, location.href).hostname.toLowerCase();
            if (host === location.hostname.toLowerCase())
                return true;
            return DAI.DISCORD_HOST_SUFFIXES.some(suffix => host === suffix || host.endsWith("." + suffix));
        }
        catch {
            return false;
        }
    }
    DAI.isDiscordOwnedUrl = isDiscordOwnedUrl;
    function isUserContentAssetUrl(url) {
        try {
            const parsed = new URL(url, location.href);
            const host = parsed.hostname.toLowerCase();
            const path = parsed.pathname.toLowerCase();
            if (!isDiscordOwnedUrl(parsed.href))
                return false;
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
        }
        catch {
            return false;
        }
    }
    DAI.isUserContentAssetUrl = isUserContentAssetUrl;
    function isLikelyClientAssetUrl(url) {
        if (url.startsWith("data:") || url.startsWith("blob:"))
            return false;
        try {
            const parsed = new URL(url, location.href);
            const path = parsed.pathname.toLowerCase();
            if (!isDiscordOwnedUrl(parsed.href))
                return false;
            if (isUserContentAssetUrl(parsed.href))
                return false;
            return (path.startsWith("/assets/") ||
                path === "/assets" ||
                path.includes("/assets/"));
        }
        catch {
            return false;
        }
    }
    DAI.isLikelyClientAssetUrl = isLikelyClientAssetUrl;
    function shouldIncludeAsset(url, source, includeUserContent) {
        if (includeUserContent)
            return true;
        if (isUserContentAssetUrl(url))
            return false;
        const runtimeOnlySources = new Set(["dom", "performance", "cache"]);
        if (!runtimeOnlySources.has(source))
            return true;
        return isLikelyClientAssetUrl(url);
    }
    DAI.shouldIncludeAsset = shouldIncludeAsset;
    function assetRegex() {
        const ext = [...DAI.EXTENSIONS].join("|");
        return new RegExp("(?:https?:\\\\?/\\\\?/[^\\\"'`\\\\\\s){}]+\\.(?:" + ext + ")(?=[?\\\"'`\\\\\\s){}]|$))|" +
            "(?:(?:\\\\?/?assets\\\\?/)?[a-fA-F0-9_-]{8,}\\.(?:" + ext + "))", "gi");
    }
    DAI.assetRegex = assetRegex;
    function formatCopy(item, format) {
        const name = item.name || "asset";
        if (format === "markdown") {
            return assetKind(item.extension) === "image" ? `![${name}](${item.url})` : `[${name}](${item.url})`;
        }
        if (format === "css")
            return `url(${JSON.stringify(item.url)})`;
        if (format === "html") {
            return assetKind(item.extension) === "image"
                ? `<img src="${escapeHtml(item.url)}" alt="${escapeHtml(name)}">`
                : `<a href="${escapeHtml(item.url)}">${escapeHtml(name)}</a>`;
        }
        return item.url;
    }
    DAI.formatCopy = formatCopy;
    async function copyText(text) {
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
    DAI.copyText = copyText;
    function downloadBlob(blob, name) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = name;
        a.rel = "noopener";
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 30000);
    }
    DAI.downloadBlob = downloadBlob;
    function saveJson(data, name) {
        downloadBlob(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }), name);
    }
    DAI.saveJson = saveJson;
    function debounce(fn, wait) {
        let timer = 0;
        return ((...args) => {
            window.clearTimeout(timer);
            timer = window.setTimeout(() => fn(...args), wait);
        });
    }
    DAI.debounce = debounce;
})(DAI || (DAI = {}));
var DAI;
(function (DAI) {
    class AssetRegistry {
        constructor(runtime = null) {
            this.runtime = runtime;
            this.items = new Map();
            this.includeUserContent = false;
        }
        setIncludeUserContent(value) {
            this.includeUserContent = value;
            if (value)
                return 0;
            let removed = 0;
            for (const [url, item] of this.items) {
                const keep = [...item.sources].some(source => DAI.shouldIncludeAsset(url, source, false));
                if (!keep) {
                    this.items.delete(url);
                    removed++;
                }
            }
            return removed;
        }
        isUserContentEnabled() {
            return this.includeUserContent;
        }
        setRuntime(runtime) {
            this.runtime = runtime;
        }
        add(raw, source, moduleId) {
            const url = DAI.normalizeUrl(raw, this.runtime);
            if (!url || url.endsWith("/"))
                return false;
            if (!DAI.shouldIncludeAsset(url, source, this.includeUserContent))
                return false;
            let extension = DAI.getExtension(url);
            if (!extension && /(?:cdn\.discordapp\.com|media\.discordapp\.net)/i.test(url)) {
                extension = "webp";
            }
            if (!DAI.EXTENSIONS.has(extension) && !url.startsWith("data:") && !url.startsWith("blob:"))
                return false;
            const existing = this.items.get(url);
            if (existing) {
                existing.sources.add(source);
                if (moduleId)
                    existing.modules.add(moduleId);
                return false;
            }
            this.items.set(url, {
                url,
                name: DAI.fileName(url),
                extension,
                sources: new Set([source]),
                modules: new Set(moduleId ? [moduleId] : [])
            });
            return true;
        }
        get(url) {
            return this.items.get(url);
        }
        size() {
            return this.items.size;
        }
        values() {
            return [...this.items.values()];
        }
        serialize() {
            return this.values().map(item => ({
                url: item.url,
                name: item.name,
                extension: item.extension,
                kind: DAI.assetKind(item.extension),
                sources: [...item.sources],
                modules: [...item.modules]
            }));
        }
    }
    DAI.AssetRegistry = AssetRegistry;
})(DAI || (DAI = {}));
var DAI;
(function (DAI) {
    class WebpackScanner {
        constructor(registry) {
            this.registry = registry;
            this.chunkIds = new Set();
            this.runtime = null;
        }
        connect() {
            try {
                if (typeof webpackChunkdiscord_app === "undefined" || !webpackChunkdiscord_app?.push)
                    return null;
                let runtime = null;
                const marker = Symbol("discord_asset_inspector");
                webpackChunkdiscord_app.push([[marker], {}, (r) => { runtime = r; }]);
                webpackChunkdiscord_app.pop();
                this.runtime = runtime;
                this.registry.setRuntime(runtime);
                return runtime;
            }
            catch {
                return null;
            }
        }
        scanLoadedModules() {
            const before = this.registry.size();
            const modules = this.runtime?.m;
            if (!modules)
                return { added: 0, scannedModules: 0, discoveredChunks: 0 };
            const assetRe = DAI.assetRegex();
            const chunkRe = /\.e\(\s*["']?([\w$-]+)["']?\s*\)/g;
            let scanned = 0;
            for (const [id, factory] of Object.entries(modules)) {
                let code = "";
                try {
                    code = factory.toString();
                }
                catch {
                    continue;
                }
                scanned++;
                assetRe.lastIndex = 0;
                let match;
                while ((match = assetRe.exec(code)))
                    this.registry.add(match[0], "webpack", id);
                chunkRe.lastIndex = 0;
                while ((match = chunkRe.exec(code)))
                    this.chunkIds.add(match[1]);
            }
            return {
                added: this.registry.size() - before,
                scannedModules: scanned,
                discoveredChunks: this.chunkIds.size
            };
        }
        resolveResource(id, kind) {
            try {
                const resolver = kind === "js" ? this.runtime?.u : this.runtime?.miniCssF;
                if (!resolver)
                    return null;
                const relative = resolver(id);
                if (!relative)
                    return null;
                const base = this.runtime?.p || location.origin + "/";
                const url = new URL(relative, base).href;
                return DAI.isDiscordOwnedUrl(url) ? url : null;
            }
            catch {
                return null;
            }
        }
        async scanLazyResources(signal, onProgress) {
            const before = this.registry.size();
            const queue = [];
            const seen = new Set();
            for (const id of this.chunkIds) {
                const js = this.resolveResource(id, "js");
                const css = this.resolveResource(id, "css");
                if (js)
                    queue.push({ url: js, source: "lazy-js" });
                if (css)
                    queue.push({ url: css, source: "lazy-css" });
            }
            const unique = queue.filter(item => {
                if (seen.has(item.url))
                    return false;
                seen.add(item.url);
                return true;
            }).slice(0, 500);
            let next = 0;
            let done = 0;
            let failed = 0;
            const assetRe = DAI.assetRegex();
            const workers = Math.min(4, unique.length || 1);
            const worker = async () => {
                while (next < unique.length && !signal.aborted) {
                    const item = unique[next++];
                    try {
                        const response = await fetch(item.url, {
                            method: "GET",
                            cache: "force-cache",
                            credentials: "same-origin",
                            signal
                        });
                        if (!response.ok)
                            throw new Error(String(response.status));
                        const text = await response.text();
                        assetRe.lastIndex = 0;
                        let match;
                        while ((match = assetRe.exec(text)))
                            this.registry.add(match[0], item.source);
                    }
                    catch {
                        if (!signal.aborted)
                            failed++;
                    }
                    finally {
                        done++;
                        onProgress?.(done, unique.length);
                    }
                }
            };
            await Promise.all(Array.from({ length: workers }, worker));
            return {
                added: this.registry.size() - before,
                scannedResources: done,
                failedResources: failed,
                discoveredChunks: this.chunkIds.size
            };
        }
    }
    DAI.WebpackScanner = WebpackScanner;
})(DAI || (DAI = {}));
var DAI;
(function (DAI) {
    function scanDom(registry) {
        const before = registry.size();
        const elements = document.querySelectorAll("img,video,audio,source,link,script");
        for (const element of elements) {
            for (const attr of ["src", "href", "poster"]) {
                const value = element.getAttribute(attr);
                if (value)
                    registry.add(value, "dom");
            }
        }
        return { added: registry.size() - before, scannedResources: elements.length };
    }
    DAI.scanDom = scanDom;
})(DAI || (DAI = {}));
var DAI;
(function (DAI) {
    function scanPerformance(registry) {
        const before = registry.size();
        const entries = performance.getEntriesByType("resource");
        for (const entry of entries)
            registry.add(entry.name, "performance");
        return { added: registry.size() - before, scannedResources: entries.length };
    }
    DAI.scanPerformance = scanPerformance;
})(DAI || (DAI = {}));
var DAI;
(function (DAI) {
    function scanCss(registry) {
        const before = registry.size();
        const urlRe = /url\(\s*["']?([^"')\s]+)["']?\s*\)/gi;
        let count = 0;
        const walk = (rules) => {
            for (const rule of Array.from(rules)) {
                count++;
                const nested = rule.cssRules;
                if (nested)
                    walk(nested);
                const text = rule.cssText || "";
                if (!text.includes("url("))
                    continue;
                urlRe.lastIndex = 0;
                let match;
                while ((match = urlRe.exec(text)))
                    registry.add(match[1], "css");
            }
        };
        for (const sheet of Array.from(document.styleSheets)) {
            try {
                if (sheet.cssRules)
                    walk(sheet.cssRules);
            }
            catch {
                // Cross-origin stylesheets may not expose cssRules.
            }
        }
        return { added: registry.size() - before, scannedResources: count };
    }
    DAI.scanCss = scanCss;
})(DAI || (DAI = {}));
var DAI;
(function (DAI) {
    async function scanCache(registry) {
        const before = registry.size();
        let count = 0;
        try {
            if (!("caches" in window))
                return { added: 0, scannedResources: 0 };
            for (const name of await caches.keys()) {
                const cache = await caches.open(name);
                for (const request of await cache.keys()) {
                    count++;
                    registry.add(request.url, "cache");
                }
            }
        }
        catch {
            // Cache Storage availability differs between Discord builds.
        }
        return { added: registry.size() - before, scannedResources: count };
    }
    DAI.scanCache = scanCache;
})(DAI || (DAI = {}));
var DAI;
(function (DAI) {
    DAI.STYLES = `
#${DAI.ROOT_ID} {
  position: fixed;
  inset: 0;
  z-index: 2147483646;
  color: #e7e9ee;
  font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

#${DAI.ROOT_ID} * { box-sizing: border-box; }

#${DAI.ROOT_ID} .dai-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(6, 8, 12, .72);
  backdrop-filter: blur(8px);
}

#${DAI.ROOT_ID} .dai-panel {
  position: absolute;
  inset: 4vh 3vw;
  max-width: 1500px;
  margin: auto;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.09);
  border-radius: 18px;
  background: #17191f;
  box-shadow: 0 28px 90px rgba(0,0,0,.46);
}

#${DAI.ROOT_ID} .dai-head {
  min-height: 70px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(255,255,255,.07);
  background: #181a20;
}

#${DAI.ROOT_ID} .dai-brand { min-width: 230px; }
#${DAI.ROOT_ID} .dai-title { font-size: 15px; font-weight: 720; letter-spacing: -.15px; }
#${DAI.ROOT_ID} .dai-sub { margin-top: 3px; color: #7f8795; font-size: 10px; }
#${DAI.ROOT_ID} .dai-spacer { flex: 1; }

#${DAI.ROOT_ID} button,
#${DAI.ROOT_ID} input,
#${DAI.ROOT_ID} select {
  font: inherit;
}

#${DAI.ROOT_ID} button {
  border: 1px solid rgba(255,255,255,.09);
  border-radius: 9px;
  background: #22252c;
  color: #dfe2e8;
  padding: 8px 11px;
  cursor: pointer;
  transition: background .14s ease, border-color .14s ease, color .14s ease;
}

#${DAI.ROOT_ID} button:hover {
  background: #292d35;
  border-color: rgba(255,255,255,.14);
}

#${DAI.ROOT_ID} button:disabled {
  opacity: .42;
  cursor: default;
}

#${DAI.ROOT_ID} .dai-primary {
  background: #5865f2;
  border-color: #6772f4;
  color: white;
}

#${DAI.ROOT_ID} .dai-primary:hover { background: #626ef3; }

#${DAI.ROOT_ID} .dai-close {
  width: 36px;
  height: 36px;
  padding: 0;
  font-size: 18px;
}

#${DAI.ROOT_ID} .dai-tools {
  display: grid;
  grid-template-columns: minmax(280px, 1fr) 150px 150px 150px;
  gap: 8px;
  padding: 12px 18px 9px;
}

#${DAI.ROOT_ID} input,
#${DAI.ROOT_ID} select {
  width: 100%;
  height: 36px;
  border: 1px solid rgba(255,255,255,.09);
  border-radius: 9px;
  background: #20232a;
  color: #e4e7ec;
  padding: 0 10px;
  outline: none;
}

#${DAI.ROOT_ID} input::placeholder { color: #666e7c; }

#${DAI.ROOT_ID} input:focus,
#${DAI.ROOT_ID} select:focus {
  border-color: rgba(88,101,242,.72);
}

#${DAI.ROOT_ID} .dai-kinds {
  display: flex;
  gap: 4px;
  padding: 0 18px 9px;
  overflow-x: auto;
  scrollbar-width: none;
  border-bottom: 1px solid rgba(255,255,255,.055);
}

#${DAI.ROOT_ID} .dai-kinds::-webkit-scrollbar { display: none; }

#${DAI.ROOT_ID} .dai-kinds button {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-color: transparent;
  border-radius: 7px;
  background: transparent;
  color: #858d9a;
  font-size: 10px;
}

#${DAI.ROOT_ID} .dai-kinds button b {
  min-width: 18px;
  color: #626a77;
  font-size: 9px;
  font-weight: 650;
  text-align: right;
}

#${DAI.ROOT_ID} .dai-kinds button:hover {
  background: #20232a;
  color: #cdd2da;
}

#${DAI.ROOT_ID} .dai-kinds button.is-active {
  background: #242832;
  color: #eef0f4;
  box-shadow: inset 0 -2px #5865f2;
}

#${DAI.ROOT_ID} .dai-bulk {
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 18px;
  border-bottom: 1px solid rgba(255,255,255,.055);
}

#${DAI.ROOT_ID} .dai-bulk button {
  padding: 6px 9px;
  font-size: 10px;
}

#${DAI.ROOT_ID} .dai-bulk button.is-active {
  border-color: rgba(88,101,242,.5);
  background: rgba(88,101,242,.13);
  color: #dfe2ff;
}

#${DAI.ROOT_ID} .dai-content-toggle {
  color: #8f97a4;
}

#${DAI.ROOT_ID} .dai-content-toggle.is-active {
  border-color: rgba(250,166,26,.34);
  background: rgba(250,166,26,.09);
  color: #f2c26f;
}

#${DAI.ROOT_ID} .dai-bulk select {
  width: 126px;
  height: 31px;
  font-size: 10px;
}

#${DAI.ROOT_ID} .dai-progress {
  height: 2px;
  background: rgba(255,255,255,.04);
  overflow: hidden;
}

#${DAI.ROOT_ID} .dai-progress > i {
  display: block;
  width: var(--p, 0%);
  height: 100%;
  background: #5865f2;
  transition: width .15s linear;
}

#${DAI.ROOT_ID} .dai-status {
  display: flex;
  align-items: center;
  gap: 13px;
  min-height: 34px;
  padding: 8px 18px;
  color: #858d9a;
  font-size: 10.5px;
  border-bottom: 1px solid rgba(255,255,255,.05);
}

#${DAI.ROOT_ID} .dai-status strong { color: #e4e7ec; }

#${DAI.ROOT_ID} .dai-grid {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 14px 18px 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(245px, 1fr));
  align-content: start;
  gap: 12px;
  scrollbar-width: thin;
  scrollbar-color: #555b66 transparent;
}

#${DAI.ROOT_ID} .dai-card {
  position: relative;
  min-width: 0;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.075);
  border-radius: 13px;
  background: #1c1f25;
  transition: border-color .14s ease, background .14s ease, transform .14s ease;
}

#${DAI.ROOT_ID} .dai-card:hover {
  border-color: rgba(255,255,255,.14);
  background: #1e2128;
  transform: translateY(-1px);
}

#${DAI.ROOT_ID} .dai-card.is-selected {
  border-color: rgba(88,101,242,.82);
  box-shadow: inset 0 0 0 1px rgba(88,101,242,.16);
}

#${DAI.ROOT_ID} .dai-preview {
  position: relative;
  aspect-ratio: 16 / 9;
  display: grid;
  place-items: center;
  overflow: hidden;
  background:
    linear-gradient(45deg, rgba(255,255,255,.015) 25%, transparent 25%),
    linear-gradient(-45deg, rgba(255,255,255,.015) 25%, transparent 25%),
    #111318;
  background-size: 18px 18px;
}

#${DAI.ROOT_ID} .dai-preview img,
#${DAI.ROOT_ID} .dai-preview video {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

#${DAI.ROOT_ID} .dai-preview-top {
  position: absolute;
  inset: 8px 8px auto 8px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  pointer-events: none;
}

#${DAI.ROOT_ID} .dai-badges {
  display: flex;
  gap: 5px;
  min-width: 0;
}

#${DAI.ROOT_ID} .dai-kind-badge,
#${DAI.ROOT_ID} .dai-ext-badge {
  padding: 4px 6px;
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 6px;
  background: rgba(13,15,19,.78);
  color: #d7dbe2;
  backdrop-filter: blur(6px);
  font-size: 8px;
  font-weight: 650;
  letter-spacing: .025em;
}

#${DAI.ROOT_ID} .dai-ext-badge {
  color: #8f98a6;
  font-weight: 600;
}

#${DAI.ROOT_ID} .dai-select {
  width: 27px;
  height: 27px;
  flex: 0 0 27px;
  padding: 0;
  display: grid;
  place-items: center;
  border: 1px solid rgba(255,255,255,.18);
  border-radius: 50%;
  background: rgba(13,15,19,.72);
  color: white;
  opacity: .55;
  pointer-events: auto;
  backdrop-filter: blur(6px);
}

#${DAI.ROOT_ID} .dai-card:hover .dai-select,
#${DAI.ROOT_ID} .dai-card.is-selected .dai-select {
  opacity: 1;
}

#${DAI.ROOT_ID} .dai-card.is-selected .dai-select {
  border-color: #6d78f4;
  background: #5865f2;
}

#${DAI.ROOT_ID} .dai-select span {
  font-size: 13px;
  line-height: 1;
}

#${DAI.ROOT_ID} .dai-filetype,
#${DAI.ROOT_ID} .dai-fonttype {
  display: grid;
  place-items: center;
  gap: 4px;
  color: #6d7582;
  text-transform: uppercase;
}

#${DAI.ROOT_ID} .dai-filetype b {
  color: #929aa7;
  font-size: 18px;
  letter-spacing: .08em;
}

#${DAI.ROOT_ID} .dai-filetype span,
#${DAI.ROOT_ID} .dai-fonttype span {
  font-size: 8px;
  letter-spacing: .08em;
}

#${DAI.ROOT_ID} .dai-fonttype b {
  color: #aeb4be;
  font-family: Georgia, serif;
  font-size: 36px;
  font-weight: 500;
  text-transform: none;
}

#${DAI.ROOT_ID} .dai-body {
  padding: 11px 11px 10px;
}

#${DAI.ROOT_ID} .dai-name {
  overflow: hidden;
  color: #e6e9ee;
  font-size: 12px;
  font-weight: 680;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

#${DAI.ROOT_ID} .dai-location {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
  margin-top: 5px;
  color: #707986;
  font-size: 9.5px;
  white-space: nowrap;
}

#${DAI.ROOT_ID} .dai-host {
  min-width: 0;
  overflow: hidden;
  color: #858e9c;
  text-overflow: ellipsis;
}

#${DAI.ROOT_ID} .dai-dot { color: #4f5662; }

#${DAI.ROOT_ID} .dai-footer {
  display: grid;
  gap: 9px;
  margin-top: 10px;
}

#${DAI.ROOT_ID} .dai-chips {
  min-height: 19px;
  display: flex;
  gap: 5px;
  overflow: hidden;
}

#${DAI.ROOT_ID} .dai-chip {
  flex: 0 0 auto;
  padding: 3px 6px;
  border-radius: 6px;
  background: rgba(255,255,255,.055);
  color: #9da5b1;
  font-size: 8.5px;
}

#${DAI.ROOT_ID} .dai-actions {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 5px;
}

#${DAI.ROOT_ID} .dai-actions button {
  min-width: 0;
  padding: 6px 5px;
  border-radius: 7px;
  background: #22252c;
  color: #abb2bd;
  font-size: 9.5px;
}

#${DAI.ROOT_ID} .dai-actions button:hover {
  color: #eef0f4;
}

#${DAI.ROOT_ID} .dai-actions .dai-download {
  border-color: rgba(88,101,242,.3);
  color: #cfd3ff;
  background: rgba(88,101,242,.1);
}

#${DAI.ROOT_ID} .dai-actions .dai-download:hover {
  background: rgba(88,101,242,.18);
}

#${DAI.ROOT_ID} .dai-empty {
  grid-column: 1 / -1;
  padding: 70px 20px;
  color: #747d8b;
  text-align: center;
}

@media (max-width: 1000px) {
  #${DAI.ROOT_ID} .dai-panel { inset: 2vh 2vw; }
  #${DAI.ROOT_ID} .dai-tools { grid-template-columns: 1fr 1fr; }
  #${DAI.ROOT_ID} .dai-tools input { grid-column: 1 / -1; }
  #${DAI.ROOT_ID} .dai-brand { min-width: 0; }
  #${DAI.ROOT_ID} .dai-head .dai-secondary { display: none; }
  #${DAI.ROOT_ID} .dai-grid { grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); }
}

@media (max-width: 700px) {
  #${DAI.ROOT_ID} .dai-head { padding: 12px; }
  #${DAI.ROOT_ID} .dai-tools { padding-left: 12px; padding-right: 12px; }
  #${DAI.ROOT_ID} .dai-kinds { padding-left: 12px; padding-right: 12px; }
  #${DAI.ROOT_ID} .dai-bulk { padding-left: 12px; padding-right: 12px; flex-wrap: wrap; }
  #${DAI.ROOT_ID} .dai-bulk .dai-spacer { display: none; }
  #${DAI.ROOT_ID} .dai-status { padding-left: 12px; padding-right: 12px; overflow-x: auto; white-space: nowrap; }
  #${DAI.ROOT_ID} .dai-grid { padding: 12px; }
}

@media (max-width: 560px) {
  #${DAI.ROOT_ID} .dai-panel { inset: 0; border-radius: 0; }
  #${DAI.ROOT_ID} .dai-tools { grid-template-columns: 1fr; }
  #${DAI.ROOT_ID} .dai-tools input { grid-column: auto; }
  #${DAI.ROOT_ID} .dai-bulk select,
  #${DAI.ROOT_ID} .dai-bulk button[data-action="json"] { display: none; }
  #${DAI.ROOT_ID} .dai-grid { grid-template-columns: 1fr; }
}
`;
})(DAI || (DAI = {}));
var DAI;
(function (DAI) {
    class InspectorApp {
        constructor(onClose) {
            this.onClose = onClose;
            this.visible = [];
            this.selected = new Set();
            this.kind = "all";
            this.selectedOnly = false;
            this.abortController = new AbortController();
            this.closed = false;
            this.registry = new DAI.AssetRegistry();
            this.webpack = new DAI.WebpackScanner(this.registry);
            this.onKeydown = (event) => {
                if (event.key === "Escape")
                    this.close();
            };
        }
        async start() {
            this.webpack.connect();
            this.renderShell();
            await this.rescan();
        }
        renderShell() {
            document.getElementById(DAI.ROOT_ID)?.remove();
            this.root = document.createElement("div");
            this.root.id = DAI.ROOT_ID;
            this.root.innerHTML = `
        <style>${DAI.STYLES}</style>
        <div class="dai-backdrop"></div>
        <section class="dai-panel" role="dialog" aria-modal="true" aria-label="Discord Asset Inspector">
          <header class="dai-head">
            <div class="dai-brand"><div class="dai-title">Discord Asset Inspector</div><div class="dai-sub">v${DAI.VERSION} · yerel varlık inceleme aracı</div></div>
            <div class="dai-spacer"></div>
            <button class="dai-secondary" data-action="rescan">Yeniden Tara</button>
            <button class="dai-primary" data-action="lazy">Ek kaynakları tara</button>
            <button class="dai-secondary" data-action="json">JSON dışa aktar</button>
            <button class="dai-close" data-action="close" aria-label="Kapat">×</button>
          </header>
          <div class="dai-tools">
            <input data-role="search" placeholder="Dosya adı, URL, kaynak veya modül ara…" autocomplete="off" />
            <select data-role="extension"><option value="">Tüm uzantılar</option></select>
            <select data-role="source"><option value="">Tüm kaynaklar</option></select>
            <select data-role="sort"><option value="name">Ada göre</option><option value="extension">Uzantıya göre</option><option value="source">Kaynak sayısı</option><option value="module">Modül sayısı</option></select>
          </div>
          <div class="dai-kinds">
            <button class="is-active" data-action="kind" data-kind="all">Tümü <b data-kind-count="all">0</b></button>
            <button data-action="kind" data-kind="image">Görseller <b data-kind-count="image">0</b></button>
            <button data-action="kind" data-kind="video">Videolar <b data-kind-count="video">0</b></button>
            <button data-action="kind" data-kind="audio">Sesler <b data-kind-count="audio">0</b></button>
            <button data-action="kind" data-kind="font">Yazı tipleri <b data-kind-count="font">0</b></button>
            <button data-action="kind" data-kind="code">Kod & veri <b data-kind-count="code">0</b></button>
            <button data-action="kind" data-kind="other">Diğer <b data-kind-count="other">0</b></button>
          </div>
          <div class="dai-bulk">
            <button data-action="select-visible">Görünenleri seç</button>
            <button data-action="selected-only" aria-pressed="false">Yalnız seçilenler</button>
            <button data-action="clear-selection">Temizle</button>
            <button class="dai-content-toggle" data-action="user-content" aria-pressed="false">Kullanıcı içeriği: Kapalı</button>
            <span class="dai-spacer"></span>
            <select data-role="copy-format" aria-label="Kopyalama biçimi"><option value="url">URL</option><option value="markdown">Markdown</option><option value="css">CSS url()</option><option value="html">HTML</option></select>
            <button data-action="copy-selected" disabled>Seçilenleri kopyala</button>
            <button data-action="json">JSON dışa aktar</button>
          </div>
          <div class="dai-progress"><i data-role="progress"></i></div>
          <div class="dai-status"><span><strong data-role="count">0</strong> görünür</span><span><strong data-role="selected-count">0</strong> seçili</span><span><strong data-role="source-count">0</strong> kaynak türü</span><span data-role="status">Hazır</span></div>
          <div class="dai-grid" data-role="grid"></div>
        </section>`;
            document.body.appendChild(this.root);
            this.grid = this.must("[data-role=grid]");
            this.countEl = this.must("[data-role=count]");
            this.sourceCountEl = this.must("[data-role=source-count]");
            this.statusTextEl = this.must("[data-role=status]");
            this.progressEl = this.must("[data-role=progress]");
            this.searchEl = this.must("[data-role=search]");
            this.extensionEl = this.must("[data-role=extension]");
            this.sourceEl = this.must("[data-role=source]");
            this.sortEl = this.must("[data-role=sort]");
            this.lazyButton = this.must("[data-action=lazy]");
            this.copyFormatEl = this.must("[data-role=copy-format]");
            this.copySelectedButton = this.must("[data-action=copy-selected]");
            this.selectedCountEl = this.must("[data-role=selected-count]");
            this.selectedOnlyButton = this.must("[data-action=selected-only]");
            this.userContentButton = this.must("[data-action=user-content]");
            const refresh = DAI.debounce(() => this.applyFilters(), 120);
            this.searchEl.addEventListener("input", refresh);
            this.extensionEl.addEventListener("change", () => this.applyFilters());
            this.sourceEl.addEventListener("change", () => this.applyFilters());
            this.sortEl.addEventListener("change", () => this.applyFilters());
            this.root.addEventListener("click", event => this.handleClick(event));
            this.root.querySelector(".dai-backdrop")?.addEventListener("click", () => this.close());
            document.addEventListener("keydown", this.onKeydown, true);
        }
        must(selector) {
            const element = this.root.querySelector(selector);
            if (!element)
                throw new Error("Eksik arayüz öğesi: " + selector);
            return element;
        }
        async handleClick(event) {
            const button = event.target.closest("button[data-action]");
            if (!button)
                return;
            const action = button.dataset.action;
            if (action === "close")
                return this.close();
            if (action === "rescan")
                return void this.rescan();
            if (action === "lazy")
                return void this.scanLazy();
            if (action === "json")
                return DAI.saveJson(this.registry.serialize(), `discord-assets-${Date.now()}.json`);
            if (action === "kind") {
                this.kind = (button.dataset.kind || "all");
                this.root.querySelectorAll(".dai-kinds button").forEach(el => el.classList.toggle("is-active", el === button));
                this.applyFilters();
                return;
            }
            if (action === "select-visible") {
                this.visible.forEach(item => this.selected.add(item.url));
                this.applyFilters();
                return;
            }
            if (action === "clear-selection") {
                this.selected.clear();
                this.applyFilters();
                return;
            }
            if (action === "selected-only") {
                this.selectedOnly = !this.selectedOnly;
                this.selectedOnlyButton.setAttribute("aria-pressed", String(this.selectedOnly));
                this.selectedOnlyButton.classList.toggle("is-active", this.selectedOnly);
                this.applyFilters();
                return;
            }
            if (action === "user-content") {
                const enabled = !this.registry.isUserContentEnabled();
                const removed = this.registry.setIncludeUserContent(enabled);
                this.userContentButton.setAttribute("aria-pressed", String(enabled));
                this.userContentButton.classList.toggle("is-active", enabled);
                this.userContentButton.textContent = `Kullanıcı içeriği: ${enabled ? "Açık" : "Kapalı"}`;
                if (enabled) {
                    this.setStatus("Kullanıcı içeriği dahil ediliyor…");
                    await this.rescan();
                }
                else {
                    for (const url of [...this.selected]) {
                        if (!this.registry.get(url))
                            this.selected.delete(url);
                    }
                    this.rebuildFilters();
                    this.applyFilters();
                    this.setStatus(`Kullanıcı içeriği gizlendi · ${removed} kayıt kaldırıldı.`);
                }
                return;
            }
            if (action === "copy-selected") {
                const items = this.registry.values().filter(item => this.selected.has(item.url));
                if (!items.length)
                    return;
                const format = this.copyFormatEl.value;
                await DAI.copyText(items.map(item => DAI.formatCopy(item, format)).join("\n"));
                this.setStatus(`${items.length} seçili varlık kopyalandı.`);
                return;
            }
            const card = button.closest(".dai-card");
            const url = card?.dataset.url;
            if (!url)
                return;
            const item = this.registry.get(url);
            if (!item)
                return;
            if (action === "toggle-select") {
                if (this.selected.has(url))
                    this.selected.delete(url);
                else
                    this.selected.add(url);
                this.applyFilters();
                return;
            }
            if (action === "copy") {
                await DAI.copyText(DAI.formatCopy(item, this.copyFormatEl.value));
                this.setStatus("Kopyalandı.");
            }
            else if (action === "open") {
                window.open(url, "_blank", "noopener,noreferrer");
            }
            else if (action === "download") {
                await this.downloadAsset(url);
            }
        }
        async rescan() {
            if (this.closed)
                return;
            this.setStatus("Yüklü kaynaklar taranıyor…");
            this.webpack.connect();
            const reports = [
                this.webpack.scanLoadedModules(),
                DAI.scanPerformance(this.registry),
                DAI.scanDom(this.registry),
                DAI.scanCss(this.registry),
                await DAI.scanCache(this.registry)
            ];
            const added = reports.reduce((sum, report) => sum + report.added, 0);
            this.rebuildFilters();
            this.applyFilters();
            this.setStatus(`Tarama tamamlandı · ${added} yeni varlık.`);
        }
        async scanLazy() {
            if (this.closed || this.lazyButton.disabled)
                return;
            this.lazyButton.disabled = true;
            this.setStatus("Ek Discord kaynakları taranıyor…");
            this.setProgress(0);
            try {
                const report = await this.webpack.scanLazyResources(this.abortController.signal, (done, total) => {
                    this.setProgress(total ? (done / total) * 100 : 0);
                    this.setStatus(`Ek tarama ${done}/${total}…`);
                });
                this.rebuildFilters();
                this.applyFilters();
                this.setStatus(`Ek tarama tamamlandı · ${report.added} yeni varlık · ${report.failedResources || 0} başarısız.`);
            }
            finally {
                this.setProgress(0);
                this.lazyButton.disabled = false;
            }
        }
        rebuildFilters() {
            const extension = this.extensionEl.value;
            const source = this.sourceEl.value;
            const extensions = [...new Set(this.registry.values().map(item => item.extension).filter(Boolean))].sort();
            const sources = [...new Set(this.registry.values().flatMap(item => [...item.sources]))].sort();
            this.extensionEl.innerHTML = `<option value="">Tüm uzantılar</option>${extensions.map(x => `<option value="${DAI.escapeHtml(x)}">${DAI.escapeHtml(x.toUpperCase())}</option>`).join("")}`;
            this.sourceEl.innerHTML = `<option value="">Tüm kaynaklar</option>${sources.map(x => `<option value="${DAI.escapeHtml(x)}">${DAI.escapeHtml(DAI.sourceLabel(x))}</option>`).join("")}`;
            if (extensions.includes(extension))
                this.extensionEl.value = extension;
            if (sources.includes(source))
                this.sourceEl.value = source;
        }
        applyFilters() {
            const query = this.searchEl.value.trim().toLowerCase();
            const extension = this.extensionEl.value;
            const source = this.sourceEl.value;
            const sort = this.sortEl.value;
            this.visible = this.registry.values().filter(item => {
                if (this.kind !== "all" && DAI.assetKind(item.extension) !== this.kind)
                    return false;
                if (this.selectedOnly && !this.selected.has(item.url))
                    return false;
                if (extension && item.extension !== extension)
                    return false;
                if (source && !item.sources.has(source))
                    return false;
                if (!query)
                    return true;
                return [item.name, item.url, item.extension, ...item.sources, ...item.modules]
                    .join(" ")
                    .toLowerCase()
                    .includes(query);
            });
            this.visible.sort((a, b) => {
                if (sort === "extension")
                    return a.extension.localeCompare(b.extension) || a.name.localeCompare(b.name);
                if (sort === "source")
                    return b.sources.size - a.sources.size || a.name.localeCompare(b.name);
                if (sort === "module")
                    return b.modules.size - a.modules.size || a.name.localeCompare(b.name);
                return a.name.localeCompare(b.name);
            });
            this.renderCards();
            this.renderKindCounts();
            this.countEl.textContent = String(this.visible.length);
            this.selectedCountEl.textContent = String(this.selected.size);
            this.sourceCountEl.textContent = String(new Set(this.registry.values().flatMap(item => [...item.sources])).size);
            this.copySelectedButton.disabled = this.selected.size === 0;
            this.copySelectedButton.textContent = this.selected.size ? `Seçilenleri kopyala (${this.selected.size})` : "Seçilenleri kopyala";
        }
        renderKindCounts() {
            const counts = { all: 0, image: 0, video: 0, audio: 0, font: 0, code: 0, other: 0 };
            for (const item of this.registry.values()) {
                counts.all++;
                counts[DAI.assetKind(item.extension)]++;
            }
            for (const [kind, count] of Object.entries(counts)) {
                const element = this.root.querySelector(`[data-kind-count="${kind}"]`);
                if (element)
                    element.textContent = String(count);
            }
        }
        renderCards() {
            if (!this.visible.length) {
                this.grid.innerHTML = `<div class="dai-empty">Geçerli filtrelerle eşleşen varlık bulunamadı.</div>`;
                return;
            }
            const limit = 350;
            const html = this.visible.slice(0, limit).map(item => {
                const preview = this.previewHtml(item);
                const selected = this.selected.has(item.url);
                const kind = DAI.assetKind(item.extension);
                const host = this.urlHost(item.url);
                const chips = [...item.sources].slice(0, 2).map(source => `<span class="dai-chip">${DAI.escapeHtml(DAI.sourceLabel(source))}</span>`).join("");
                const extraSources = Math.max(0, item.sources.size - 2);
                return `<article class="dai-card${selected ? " is-selected" : ""}" data-url="${DAI.escapeHtml(item.url)}">
          <div class="dai-preview">
            ${preview}
            <div class="dai-preview-top">
              <div class="dai-badges">
                <span class="dai-kind-badge">${DAI.escapeHtml(DAI.assetKindLabel(kind))}</span>
                <span class="dai-ext-badge">${DAI.escapeHtml((item.extension || "dosya").toUpperCase())}</span>
              </div>
              <button class="dai-select" data-action="toggle-select" aria-label="${selected ? "Seçimi kaldır" : "Seç"}" aria-pressed="${selected}">
                <span>${selected ? "✓" : ""}</span>
              </button>
            </div>
          </div>
          <div class="dai-body">
            <div class="dai-name" title="${DAI.escapeHtml(item.name)}">${DAI.escapeHtml(item.name)}</div>
            <div class="dai-location" title="${DAI.escapeHtml(item.url)}">
              <span class="dai-host">${DAI.escapeHtml(host)}</span>
              <span class="dai-dot">•</span>
              <span>${item.modules.size ? `${item.modules.size} modül` : "modül yok"}</span>
            </div>
            <div class="dai-footer">
              <div class="dai-chips">${chips}${extraSources ? `<span class="dai-chip">+${extraSources}</span>` : ""}</div>
              <div class="dai-actions">
                <button data-action="copy" title="Kopyala" aria-label="Kopyala">Kopyala</button>
                <button data-action="open" title="Yeni sekmede aç" aria-label="Aç">Aç</button>
                <button class="dai-download" data-action="download" title="İndir" aria-label="İndir">İndir</button>
              </div>
            </div>
          </div>
        </article>`;
            }).join("");
            this.grid.innerHTML = html + (this.visible.length > limit ? `<div class="dai-empty">İlk ${limit} / ${this.visible.length} sonuç gösteriliyor. Daha fazlası için filtreleri daralt.</div>` : "");
        }
        urlHost(url) {
            try {
                return new URL(url, location.href).hostname.replace(/^cdn\./, "");
            }
            catch {
                return "yerel kaynak";
            }
        }
        previewHtml(item) {
            const url = DAI.escapeHtml(item.url);
            if (DAI.IMAGE_EXTENSIONS.has(item.extension))
                return `<img loading="lazy" decoding="async" src="${url}" alt="" />`;
            if (DAI.VIDEO_EXTENSIONS.has(item.extension))
                return `<video preload="metadata" muted src="${url}"></video>`;
            if (DAI.AUDIO_EXTENSIONS.has(item.extension))
                return `<div class="dai-filetype"><b>WAVE</b><span>Ses</span></div>`;
            if (DAI.FONT_EXTENSIONS.has(item.extension))
                return `<div class="dai-fonttype"><b>Aa</b><span>Yazı tipi</span></div>`;
            if (DAI.CODE_EXTENSIONS.has(item.extension))
                return `<div class="dai-filetype"><b>&lt;/&gt;</b><span>${DAI.escapeHtml(item.extension || "Kod")}</span></div>`;
            return `<div class="dai-filetype"><b>FILE</b><span>${DAI.escapeHtml(item.extension || "Diğer")}</span></div>`;
        }
        async downloadAsset(url) {
            try {
                const response = await fetch(url, { method: "GET", cache: "force-cache", signal: this.abortController.signal });
                if (!response.ok)
                    throw new Error(String(response.status));
                DAI.downloadBlob(await response.blob(), DAI.fileName(url));
                this.setStatus("İndirme hazırlandı.");
            }
            catch {
                if (!this.closed)
                    window.open(url, "_blank", "noopener,noreferrer");
            }
        }
        setStatus(text) {
            this.statusTextEl.textContent = text;
        }
        setProgress(value) {
            this.progressEl.style.setProperty("--p", `${Math.max(0, Math.min(100, value))}%`);
        }
        close() {
            if (this.closed)
                return;
            this.closed = true;
            this.abortController.abort();
            document.removeEventListener("keydown", this.onKeydown, true);
            this.root.remove();
            this.onClose();
        }
    }
    DAI.InspectorApp = InspectorApp;
})(DAI || (DAI = {}));
var DAI;
(function (DAI) {
    let instance = null;
    function open() {
        if (instance)
            return instance;
        instance = new DAI.InspectorApp(() => { instance = null; });
        void instance.start();
        return instance;
    }
    function close() {
        instance?.close();
    }
    function toggle() {
        if (instance)
            close();
        else
            open();
    }
    const previousDispose = window.__discordAssetInspectorDispose;
    previousDispose?.();
    const onShortcut = (event) => {
        if ((event.ctrlKey || event.metaKey) && event.shiftKey && !event.altKey && event.code === "KeyK") {
            event.preventDefault();
            event.stopImmediatePropagation();
            toggle();
        }
    };
    window.addEventListener("keydown", onShortcut, true);
    window.__DISCORD_ASSET_INSPECTOR__ = {
        version: DAI.VERSION,
        open,
        close,
        toggle,
        rescan: () => instance?.rescan(),
        assets: () => instance?.registry.serialize() || []
    };
    window.__discordAssetInspectorDispose = () => {
        window.removeEventListener("keydown", onShortcut, true);
        close();
        delete window.__DISCORD_ASSET_INSPECTOR__;
        delete window.__discordAssetInspectorDispose;
    };
    open();
})(DAI || (DAI = {}));
