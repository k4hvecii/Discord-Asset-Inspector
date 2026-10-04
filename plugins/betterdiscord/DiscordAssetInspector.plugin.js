/**
 * @name DiscordAssetInspector
 * @author K4hveci
 * @description Browse and inspect assets loaded by Discord from a local BetterDiscord panel.
 * @version 0.3.0
 * @website https://github.com/k4hvecii/Discord-Asset-Inspector
 * @source https://github.com/k4hvecii/Discord-Asset-Inspector/blob/main/plugins/betterdiscord/DiscordAssetInspector.plugin.js
 */
class DiscordAssetInspectorPlugin {
    constructor() {
        this.app = null;
        this.started = false;
        this.onShortcut = (event) => {
            if ((event.ctrlKey || event.metaKey) && event.shiftKey && !event.altKey && event.code === "KeyK") {
                event.preventDefault();
                event.stopImmediatePropagation();
                this.toggle();
            }
        };
    }
    start() {
        if (this.started)
            return;
        this.started = true;
        window.addEventListener("keydown", this.onShortcut, true);
        const api = globalThis.BdApi;
        api?.UI?.showToast?.("Asset Inspector ready · Ctrl/Cmd + Shift + K", {
            type: "success",
            timeout: 3500
        });
    }
    stop() {
        if (!this.started)
            return;
        this.started = false;
        window.removeEventListener("keydown", this.onShortcut, true);
        this.close();
        document.getElementById(DAI.ROOT_ID)?.remove();
    }
    open() {
        if (this.app)
            return;
        this.app = new DAI.InspectorApp(() => {
            this.app = null;
        });
        void this.app.start();
    }
    close() {
        this.app?.close();
        this.app = null;
    }
    toggle() {
        if (this.app)
            this.close();
        else
            this.open();
    }
    getSettingsPanel() {
        const panel = document.createElement("div");
        panel.style.padding = "16px 4px";
        panel.style.display = "grid";
        panel.style.gap = "16px";
        const title = document.createElement("div");
        title.textContent = "Discord Asset Inspector";
        title.style.fontSize = "18px";
        title.style.fontWeight = "700";
        const note = document.createElement("div");
        note.textContent =
            "Open the local asset inspector from here or use Ctrl/Cmd + Shift + K anywhere in Discord. Disabling the plugin removes the shortcut and closes the inspector.";
        note.style.opacity = "0.72";
        note.style.lineHeight = "1.5";
        const actions = document.createElement("div");
        actions.style.display = "flex";
        actions.style.gap = "8px";
        actions.style.flexWrap = "wrap";
        const openButton = document.createElement("button");
        openButton.textContent = "Open Asset Inspector";
        openButton.type = "button";
        openButton.style.padding = "10px 14px";
        openButton.style.border = "0";
        openButton.style.borderRadius = "8px";
        openButton.style.cursor = "pointer";
        openButton.onclick = () => this.open();
        const rescanButton = document.createElement("button");
        rescanButton.textContent = "Rescan";
        rescanButton.type = "button";
        rescanButton.style.padding = "10px 14px";
        rescanButton.style.border = "0";
        rescanButton.style.borderRadius = "8px";
        rescanButton.style.cursor = "pointer";
        rescanButton.onclick = () => {
            if (!this.app)
                this.open();
            void this.app?.rescan();
        };
        const info = document.createElement("div");
        info.textContent = `Version ${DAI.VERSION} · No token access · No telemetry · No webhook requests`;
        info.style.fontSize = "12px";
        info.style.opacity = "0.55";
        actions.append(openButton, rescanButton);
        panel.append(title, note, actions, info);
        return panel;
    }
}
module.exports = DiscordAssetInspectorPlugin;
var DAI;
(function (DAI) {
    DAI.VERSION = "0.3.0";
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
        }
        setRuntime(runtime) {
            this.runtime = runtime;
        }
        add(raw, source, moduleId) {
            const url = DAI.normalizeUrl(raw, this.runtime);
            if (!url || url.endsWith("/"))
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
#${DAI.ROOT_ID} { position: fixed; inset: 0; z-index: 2147483646; font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #e7e9ee; }
#${DAI.ROOT_ID} * { box-sizing: border-box; }
#${DAI.ROOT_ID} .dai-backdrop { position: absolute; inset: 0; background: rgba(8,10,14,.68); backdrop-filter: blur(7px); }
#${DAI.ROOT_ID} .dai-panel { position: absolute; inset: 5vh 4vw; max-width: 1440px; margin: auto; display: flex; flex-direction: column; overflow: hidden; border: 1px solid rgba(255,255,255,.10); border-radius: 20px; background: #17191f; box-shadow: 0 30px 100px rgba(0,0,0,.45); }
#${DAI.ROOT_ID} .dai-head { display: flex; align-items: center; gap: 14px; padding: 18px 20px; border-bottom: 1px solid rgba(255,255,255,.08); }
#${DAI.ROOT_ID} .dai-brand { min-width: 220px; }
#${DAI.ROOT_ID} .dai-title { font-size: 16px; font-weight: 720; letter-spacing: -.2px; }
#${DAI.ROOT_ID} .dai-sub { margin-top: 3px; color: #9299a8; font-size: 11px; }
#${DAI.ROOT_ID} .dai-spacer { flex: 1; }
#${DAI.ROOT_ID} button, #${DAI.ROOT_ID} input, #${DAI.ROOT_ID} select { font: inherit; }
#${DAI.ROOT_ID} button { border: 1px solid rgba(255,255,255,.10); border-radius: 10px; background: #23262e; color: #e7e9ee; padding: 9px 12px; cursor: pointer; }
#${DAI.ROOT_ID} button:hover { background: #2b2f38; }
#${DAI.ROOT_ID} button:disabled { opacity: .5; cursor: default; }
#${DAI.ROOT_ID} .dai-primary { background: #5865f2; border-color: #6672f4; color: white; }
#${DAI.ROOT_ID} .dai-primary:hover { background: #6571f3; }
#${DAI.ROOT_ID} .dai-close { width: 38px; height: 38px; padding: 0; font-size: 18px; }
#${DAI.ROOT_ID} .dai-tools { display: grid; grid-template-columns: minmax(240px, 1fr) 150px 150px 150px auto; gap: 10px; padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,.08); }
#${DAI.ROOT_ID} input, #${DAI.ROOT_ID} select { width: 100%; height: 38px; border: 1px solid rgba(255,255,255,.10); border-radius: 10px; background: #20232a; color: #e7e9ee; padding: 0 11px; outline: none; }
#${DAI.ROOT_ID} input:focus, #${DAI.ROOT_ID} select:focus { border-color: rgba(88,101,242,.7); }
#${DAI.ROOT_ID} .dai-status { display: flex; align-items: center; gap: 14px; padding: 10px 20px; color: #9ca3b0; font-size: 12px; border-bottom: 1px solid rgba(255,255,255,.06); }
#${DAI.ROOT_ID} .dai-status strong { color: #eef0f4; }
#${DAI.ROOT_ID} .dai-grid { flex: 1; overflow: auto; padding: 16px 20px 22px; display: grid; grid-template-columns: repeat(auto-fill,minmax(220px,1fr)); align-content: start; gap: 12px; }
#${DAI.ROOT_ID} .dai-card { min-width: 0; overflow: hidden; border: 1px solid rgba(255,255,255,.08); border-radius: 14px; background: #1d2027; }
#${DAI.ROOT_ID} .dai-preview { height: 136px; display: grid; place-items: center; background: #12141a; overflow: hidden; }
#${DAI.ROOT_ID} .dai-preview img, #${DAI.ROOT_ID} .dai-preview video { width: 100%; height: 100%; object-fit: contain; }
#${DAI.ROOT_ID} .dai-filetype { color: #737b8c; font-size: 24px; font-weight: 760; letter-spacing: .8px; text-transform: uppercase; }
#${DAI.ROOT_ID} .dai-body { padding: 12px; }
#${DAI.ROOT_ID} .dai-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 12px; font-weight: 650; }
#${DAI.ROOT_ID} .dai-url { margin-top: 5px; color: #858d9c; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 10px; }
#${DAI.ROOT_ID} .dai-chips { display: flex; gap: 5px; flex-wrap: wrap; margin-top: 9px; min-height: 19px; }
#${DAI.ROOT_ID} .dai-chip { padding: 3px 6px; border-radius: 6px; background: rgba(255,255,255,.06); color: #aeb4c0; font-size: 9px; }
#${DAI.ROOT_ID} .dai-actions { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; margin-top: 11px; }
#${DAI.ROOT_ID} .dai-actions button { padding: 7px 6px; font-size: 10px; }
#${DAI.ROOT_ID} .dai-empty { grid-column: 1 / -1; text-align: center; color: #858d9c; padding: 70px 20px; }
#${DAI.ROOT_ID} .dai-progress { height: 3px; background: rgba(255,255,255,.06); overflow: hidden; }
#${DAI.ROOT_ID} .dai-progress > i { display: block; height: 100%; width: var(--p,0%); background: #5865f2; transition: width .15s linear; }
@media (max-width: 850px) { #${DAI.ROOT_ID} .dai-panel { inset: 2vh 2vw; } #${DAI.ROOT_ID} .dai-tools { grid-template-columns: 1fr 1fr; } #${DAI.ROOT_ID} .dai-tools input { grid-column: 1 / -1; } #${DAI.ROOT_ID} .dai-brand { min-width: 0; } #${DAI.ROOT_ID} .dai-head .dai-secondary { display: none; } }
`;
})(DAI || (DAI = {}));
var DAI;
(function (DAI) {
    class InspectorApp {
        constructor(onClose) {
            this.onClose = onClose;
            this.visible = [];
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
            <div class="dai-brand"><div class="dai-title">Discord Asset Inspector</div><div class="dai-sub">v${DAI.VERSION} · local developer utility</div></div>
            <div class="dai-spacer"></div>
            <button class="dai-secondary" data-action="rescan">Rescan</button>
            <button class="dai-primary" data-action="lazy">Scan lazy resources</button>
            <button class="dai-secondary" data-action="json">Export JSON</button>
            <button class="dai-close" data-action="close" aria-label="Close">×</button>
          </header>
          <div class="dai-tools">
            <input data-role="search" placeholder="Search filename, URL, source or module…" autocomplete="off" />
            <select data-role="extension"><option value="">All extensions</option></select>
            <select data-role="source"><option value="">All sources</option></select>
            <select data-role="sort"><option value="name">Name</option><option value="extension">Extension</option><option value="source">Source count</option></select>
            <button data-action="copy-all">Copy filtered</button>
          </div>
          <div class="dai-progress"><i data-role="progress"></i></div>
          <div class="dai-status"><span><strong data-role="count">0</strong> assets</span><span><strong data-role="source-count">0</strong> source types</span><span data-role="status">Ready</span></div>
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
                throw new Error("Missing UI element: " + selector);
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
            if (action === "copy-all") {
                await DAI.copyText(this.visible.map(item => item.url).join("\n"));
                this.setStatus(`Copied ${this.visible.length} URLs.`);
                return;
            }
            const card = button.closest(".dai-card");
            const url = card?.dataset.url;
            if (!url)
                return;
            if (action === "copy") {
                await DAI.copyText(url);
                this.setStatus("URL copied.");
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
            this.setStatus("Scanning loaded resources…");
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
            this.setStatus(`Scan complete · ${added} new asset${added === 1 ? "" : "s"}.`);
        }
        async scanLazy() {
            if (this.closed || this.lazyButton.disabled)
                return;
            this.lazyButton.disabled = true;
            this.setStatus("Scanning lazy Discord resources…");
            this.setProgress(0);
            try {
                const report = await this.webpack.scanLazyResources(this.abortController.signal, (done, total) => {
                    this.setProgress(total ? (done / total) * 100 : 0);
                    this.setStatus(`Lazy scan ${done}/${total}…`);
                });
                this.rebuildFilters();
                this.applyFilters();
                this.setStatus(`Lazy scan complete · ${report.added} new assets · ${report.failedResources || 0} failed.`);
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
            this.extensionEl.innerHTML = `<option value="">All extensions</option>${extensions.map(x => `<option value="${DAI.escapeHtml(x)}">${DAI.escapeHtml(x.toUpperCase())}</option>`).join("")}`;
            this.sourceEl.innerHTML = `<option value="">All sources</option>${sources.map(x => `<option value="${DAI.escapeHtml(x)}">${DAI.escapeHtml(x)}</option>`).join("")}`;
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
                return a.name.localeCompare(b.name);
            });
            this.renderCards();
            this.countEl.textContent = String(this.visible.length);
            this.sourceCountEl.textContent = String(new Set(this.registry.values().flatMap(item => [...item.sources])).size);
        }
        renderCards() {
            if (!this.visible.length) {
                this.grid.innerHTML = `<div class="dai-empty">No assets match the current filters.</div>`;
                return;
            }
            const limit = 350;
            const html = this.visible.slice(0, limit).map(item => {
                const preview = this.previewHtml(item);
                const chips = [...item.sources].slice(0, 4).map(source => `<span class="dai-chip">${DAI.escapeHtml(source)}</span>`).join("");
                return `<article class="dai-card" data-url="${DAI.escapeHtml(item.url)}">
          <div class="dai-preview">${preview}</div>
          <div class="dai-body">
            <div class="dai-name" title="${DAI.escapeHtml(item.name)}">${DAI.escapeHtml(item.name)}</div>
            <div class="dai-url" title="${DAI.escapeHtml(item.url)}">${DAI.escapeHtml(item.url)}</div>
            <div class="dai-chips">${chips}</div>
            <div class="dai-actions"><button data-action="copy">Copy</button><button data-action="open">Open</button><button data-action="download">Save</button></div>
          </div>
        </article>`;
            }).join("");
            this.grid.innerHTML = html + (this.visible.length > limit ? `<div class="dai-empty">Showing first ${limit} of ${this.visible.length} results. Narrow the filters to inspect more.</div>` : "");
        }
        previewHtml(item) {
            const url = DAI.escapeHtml(item.url);
            if (DAI.IMAGE_EXTENSIONS.has(item.extension))
                return `<img loading="lazy" decoding="async" src="${url}" alt="" />`;
            if (DAI.VIDEO_EXTENSIONS.has(item.extension))
                return `<video preload="metadata" muted src="${url}"></video>`;
            if (DAI.AUDIO_EXTENSIONS.has(item.extension))
                return `<div class="dai-filetype">AUDIO</div>`;
            if (DAI.FONT_EXTENSIONS.has(item.extension))
                return `<div class="dai-filetype">FONT</div>`;
            return `<div class="dai-filetype">${DAI.escapeHtml(item.extension || "FILE")}</div>`;
        }
        async downloadAsset(url) {
            try {
                const response = await fetch(url, { method: "GET", cache: "force-cache", signal: this.abortController.signal });
                if (!response.ok)
                    throw new Error(String(response.status));
                DAI.downloadBlob(await response.blob(), DAI.fileName(url));
                this.setStatus("Download prepared.");
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
