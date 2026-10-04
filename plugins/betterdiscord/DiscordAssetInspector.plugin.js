/**
 * @name DiscordAssetInspector
 * @author K4hveci
 * @description Discord istemcisinin statik varlıklarını yerel BetterDiscord panelinden inceleyin.
 * @version 0.6.0
 * @website https://github.com/k4hvecii/Discord-Asset-Inspector
 * @source https://github.com/k4hvecii/Discord-Asset-Inspector/blob/main/plugins/betterdiscord/DiscordAssetInspector.plugin.js
 */
class DiscordAssetInspectorPlugin {
    constructor() {
        this.app = null;
        this.started = false;
        this.launcher = null;
        this.launcherObserver = null;
        this.launcherStyle = null;
        this.launcherMountTimer = 0;
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
        this.startLauncher();
        const api = globalThis.BdApi;
        api?.UI?.showToast?.("Asset Inspector hazır · Ctrl/Cmd + Shift + K", {
            type: "success",
            timeout: 3500
        });
    }
    stop() {
        if (!this.started)
            return;
        this.started = false;
        window.removeEventListener("keydown", this.onShortcut, true);
        this.stopLauncher();
        this.close();
        document.getElementById(DAI.ROOT_ID)?.remove();
    }
    open() {
        if (this.app)
            return;
        this.app = new DAI.InspectorApp(() => {
            this.app = null;
            this.updateLauncherState();
        });
        this.updateLauncherState();
        void this.app.start();
    }
    close() {
        this.app?.close();
        this.app = null;
        this.updateLauncherState();
    }
    toggle() {
        if (this.app)
            this.close();
        else
            this.open();
    }
    startLauncher() {
        this.stopLauncher();
        const style = document.createElement("style");
        style.id = "__discord_asset_inspector_launcher_style__";
        style.textContent = `
      #__discord_asset_inspector_launcher__ {
        width: 32px;
        height: 32px;
        flex: 0 0 32px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        margin: 0 2px;
        border: 0;
        border-radius: 8px;
        background: transparent;
        color: var(--interactive-normal, #b5bac1);
        cursor: pointer;
      }
      #__discord_asset_inspector_launcher__:hover {
        color: var(--interactive-hover, #dbdee1);
        background: var(--background-mod-subtle, rgba(255,255,255,.08));
      }
      #__discord_asset_inspector_launcher__[aria-pressed="true"] {
        color: var(--brand-500, #5865f2);
        background: color-mix(in srgb, var(--brand-500, #5865f2) 14%, transparent);
      }
      #__discord_asset_inspector_launcher__ svg {
        width: 20px;
        height: 20px;
        display: block;
        pointer-events: none;
      }
    `;
        document.head.appendChild(style);
        this.launcherStyle = style;
        this.mountLauncher();
        this.launcherObserver = new MutationObserver(() => {
            window.clearTimeout(this.launcherMountTimer);
            this.launcherMountTimer = window.setTimeout(() => this.mountLauncher(), 180);
        });
        this.launcherObserver.observe(document.body, { childList: true, subtree: true });
    }
    stopLauncher() {
        this.launcherObserver?.disconnect();
        this.launcherObserver = null;
        window.clearTimeout(this.launcherMountTimer);
        this.launcherMountTimer = 0;
        this.launcher?.remove();
        this.launcher = null;
        this.launcherStyle?.remove();
        this.launcherStyle = null;
        document.getElementById("__discord_asset_inspector_launcher__")?.remove();
        document.getElementById("__discord_asset_inspector_launcher_style__")?.remove();
    }
    findToolbar() {
        const candidates = Array.from(document.querySelectorAll('[class*="upperContainer_"] [class*="toolbar_"]'));
        return candidates.find(element => {
            if (element.closest("#" + DAI.ROOT_ID))
                return false;
            const rect = element.getBoundingClientRect();
            return rect.width > 80 && rect.height > 20 && rect.height < 70;
        }) || null;
    }
    mountLauncher() {
        const toolbar = this.findToolbar();
        if (!toolbar)
            return;
        const current = document.getElementById("__discord_asset_inspector_launcher__");
        if (current && current.parentElement === toolbar) {
            this.launcher = current;
            this.updateLauncherState();
            return;
        }
        current?.remove();
        const button = document.createElement("button");
        button.id = "__discord_asset_inspector_launcher__";
        button.type = "button";
        button.title = "Asset Inspector'ı Aç";
        button.setAttribute("aria-label", "Asset Inspector'ı Aç");
        button.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M4.75 3.5h5.5A1.75 1.75 0 0 1 12 5.25v5.5a1.75 1.75 0 0 1-1.75 1.75h-5.5A1.75 1.75 0 0 1 3 10.75v-5.5A1.75 1.75 0 0 1 4.75 3.5Zm9 0h5.5A1.75 1.75 0 0 1 21 5.25v5.5a1.75 1.75 0 0 1-1.75 1.75h-5.5A1.75 1.75 0 0 1 12 10.75v-5.5A1.75 1.75 0 0 1 13.75 3.5Zm-9 9h5.5A1.75 1.75 0 0 1 12 14.25v5.5a1.75 1.75 0 0 1-1.75 1.75h-5.5A1.75 1.75 0 0 1 3 19.75v-5.5a1.75 1.75 0 0 1 1.75-1.75Zm9 0h5.5A1.75 1.75 0 0 1 21 14.25v5.5a1.75 1.75 0 0 1-1.75 1.75h-5.5A1.75 1.75 0 0 1 12 19.75v-5.5a1.75 1.75 0 0 1 1.75-1.75Z"/>
      </svg>
    `;
        button.addEventListener("click", () => this.toggle());
        toolbar.prepend(button);
        this.launcher = button;
        this.updateLauncherState();
    }
    updateLauncherState() {
        if (!this.launcher?.isConnected)
            return;
        const open = Boolean(this.app);
        this.launcher.setAttribute("aria-pressed", String(open));
        this.launcher.title = open ? "Asset Inspector'ı Kapat" : "Asset Inspector'ı Aç";
        this.launcher.setAttribute("aria-label", this.launcher.title);
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
            "Varlık inceleyiciyi Discord'un üst araç çubuğundaki küçük düğmeden, buradan veya Ctrl/Cmd + Shift + K kısayoluyla açabilirsin. Eklentiyi kapatmak düğmeyi ve kısayolu kaldırır.";
        note.style.opacity = "0.72";
        note.style.lineHeight = "1.5";
        const actions = document.createElement("div");
        actions.style.display = "flex";
        actions.style.gap = "8px";
        actions.style.flexWrap = "wrap";
        const openButton = document.createElement("button");
        openButton.textContent = "Asset Inspector'ı Aç";
        openButton.type = "button";
        openButton.style.padding = "10px 14px";
        openButton.style.border = "0";
        openButton.style.borderRadius = "8px";
        openButton.style.cursor = "pointer";
        openButton.onclick = () => this.open();
        const rescanButton = document.createElement("button");
        rescanButton.textContent = "Yeniden Tara";
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
        info.textContent = `Sürüm ${DAI.VERSION} · Token erişimi yok · Telemetri yok · Webhook isteği yok`;
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
    DAI.VERSION = "0.6.0";
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
        return value.replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[char] || char);
    }
    DAI.escapeHtml = escapeHtml;
    function fileName(url) {
        try {
            const parsed = new URL(url, location.href);
            return decodeURIComponent(parsed.pathname.split("/").pop() || "asset");
        }
        catch {
            return "asset";
        }
    }
    DAI.fileName = fileName;
    function getExtension(url) {
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
            performance: "Yüklü kaynak",
            css: "CSS",
            webpack: "Webpack",
            "lazy-js": "Ek JS",
            "lazy-css": "Ek CSS"
        };
        return labels[source];
    }
    DAI.sourceLabel = sourceLabel;
    function normalizeUrl(raw, runtime) {
        let value = String(raw || "").trim().replace(/\\(?:\/|u002f)/gi, "/");
        value = value.replace(/^[\"'\x60]|[\"'\x60]$/g, "");
        if (!value || value.includes("${") || value.includes("#{"))
            return null;
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
    function isStaticClientAssetUrl(url) {
        try {
            const parsed = new URL(url, location.href);
            if (!isDiscordOwnedUrl(parsed.href))
                return false;
            const path = parsed.pathname.toLowerCase();
            if (!(path === "/assets" || path.startsWith("/assets/") || path.includes("/assets/")))
                return false;
            const blocked = [
                "/attachments/", "/avatars/", "/guilds/", "/banners/", "/emojis/",
                "/stickers/", "/role-icons/", "/app-icons/", "/avatar-decorations/",
                "/profile-effects/", "/soundboard-sounds/"
            ];
            return !blocked.some(segment => path.includes(segment));
        }
        catch {
            return false;
        }
    }
    DAI.isStaticClientAssetUrl = isStaticClientAssetUrl;
    function assetRegex() {
        const ext = [...DAI.EXTENSIONS].join("|");
        return new RegExp("(?:https?:\\\\?/\\\\?/[^\\\"'\\x60\\\\\\s){}]+\\.(?:" + ext + ")(?=[?\\\"'\\x60\\\\\\s){}]|$))|" +
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
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = name;
        anchor.rel = "noopener";
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
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
        clear() {
            this.items.clear();
        }
        setRuntime(runtime) {
            this.runtime = runtime;
        }
        add(raw, source, moduleId) {
            const url = DAI.normalizeUrl(raw, this.runtime);
            if (!url || !DAI.isStaticClientAssetUrl(url))
                return false;
            const extension = DAI.getExtension(url);
            if (!DAI.EXTENSIONS.has(extension))
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
            this.parsedModules = new WeakMap();
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
                return { added: 0, scannedModules: 0, discoveredChunks: 0, skippedAssets: 0 };
            this.chunkIds.clear();
            const assetRe = DAI.assetRegex();
            const chunkRe = /\.e\(\s*["']?([\w$-]+)["']?\s*\)/g;
            let scannedModules = 0;
            let skippedAssets = 0;
            for (const [id, factory] of Object.entries(modules)) {
                let parsed = this.parsedModules.get(factory);
                if (!parsed) {
                    let code = "";
                    try {
                        code = factory.toString();
                    }
                    catch {
                        continue;
                    }
                    assetRe.lastIndex = 0;
                    const assets = [];
                    let match;
                    while ((match = assetRe.exec(code)))
                        assets.push(match[0]);
                    chunkRe.lastIndex = 0;
                    const chunks = [];
                    while ((match = chunkRe.exec(code)))
                        chunks.push(match[1]);
                    parsed = { assets, chunks };
                    this.parsedModules.set(factory, parsed);
                }
                scannedModules++;
                parsed.chunks.forEach(chunk => this.chunkIds.add(chunk));
                for (const raw of parsed.assets) {
                    const normalized = DAI.normalizeUrl(raw, this.runtime);
                    if (!normalized || !DAI.isStaticClientAssetUrl(normalized)) {
                        skippedAssets++;
                        continue;
                    }
                    const extension = DAI.getExtension(normalized);
                    // Görselleri Webpack modül haritasından körlemesine eklemiyoruz.
                    // Emoji/flag/illustration kataloglarının büyük kısmı burada tutuluyor.
                    // Gerçekten yüklenmiş görseller Performance/CSS taramalarından gelir.
                    if (DAI.IMAGE_EXTENSIONS.has(extension)) {
                        skippedAssets++;
                        continue;
                    }
                    this.registry.add(normalized, "webpack", id);
                }
            }
            return {
                added: this.registry.size() - before,
                scannedModules,
                discoveredChunks: this.chunkIds.size,
                skippedAssets
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
                return DAI.isStaticClientAssetUrl(url) ? url : null;
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
            }).slice(0, 300);
            let cursor = 0;
            let done = 0;
            let failed = 0;
            let skippedAssets = 0;
            const workers = Math.min(3, Math.max(1, unique.length));
            const assetRe = DAI.assetRegex();
            const worker = async () => {
                while (cursor < unique.length && !signal.aborted) {
                    const item = unique[cursor++];
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
                        while ((match = assetRe.exec(text))) {
                            const normalized = DAI.normalizeUrl(match[0], this.runtime);
                            if (!normalized || !DAI.isStaticClientAssetUrl(normalized)) {
                                skippedAssets++;
                                continue;
                            }
                            const extension = DAI.getExtension(normalized);
                            const image = DAI.IMAGE_EXTENSIONS.has(extension);
                            // JS chunk içindeki ham image kataloglarını almıyoruz.
                            // CSS chunk içindeki image URL'leri stil tarafından gerçekten referanslandığı için güvenilir.
                            if (image && item.source !== "lazy-css") {
                                skippedAssets++;
                                continue;
                            }
                            this.registry.add(normalized, item.source);
                        }
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
                discoveredChunks: this.chunkIds.size,
                skippedAssets
            };
        }
    }
    DAI.WebpackScanner = WebpackScanner;
})(DAI || (DAI = {}));
var DAI;
(function (DAI) {
    function scanPerformance(registry) {
        const before = registry.size();
        const entries = performance.getEntriesByType("resource");
        let scanned = 0;
        for (const entry of entries) {
            if (!DAI.isStaticClientAssetUrl(entry.name))
                continue;
            scanned++;
            registry.add(entry.name, "performance");
        }
        return { added: registry.size() - before, scannedResources: scanned };
    }
    DAI.scanPerformance = scanPerformance;
})(DAI || (DAI = {}));
var DAI;
(function (DAI) {
    function scanCss(registry) {
        const before = registry.size();
        const urlRe = /url\(\s*["']?([^"')\s]+)["']?\s*\)/gi;
        let scanned = 0;
        const walk = (rules) => {
            for (const rule of Array.from(rules)) {
                const nested = rule.cssRules;
                if (nested)
                    walk(nested);
                const text = rule.cssText || "";
                if (!text.includes("url("))
                    continue;
                urlRe.lastIndex = 0;
                let match;
                while ((match = urlRe.exec(text))) {
                    const normalized = DAI.normalizeUrl(match[1]);
                    if (!normalized || !DAI.isStaticClientAssetUrl(normalized))
                        continue;
                    scanned++;
                    registry.add(normalized, "css");
                }
            }
        };
        for (const sheet of Array.from(document.styleSheets)) {
            try {
                if (sheet.cssRules)
                    walk(sheet.cssRules);
            }
            catch {
                // Cross-origin stylesheets are intentionally ignored.
            }
        }
        return { added: registry.size() - before, scannedResources: scanned };
    }
    DAI.scanCss = scanCss;
})(DAI || (DAI = {}));
var DAI;
(function (DAI) {
    DAI.STYLES = `
:host {
  all: initial !important;
  position: fixed !important;
  inset: 0 !important;
  z-index: 2147483646 !important;
  display: block !important;
  width: 100vw !important;
  height: 100vh !important;
  pointer-events: none !important;
}

* {
  box-sizing: border-box;
}

.app {
  position: fixed;
  inset: 0;
  pointer-events: auto;
  color: #e6e9ef;
  font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.backdrop {
  position: absolute;
  inset: 0;
  background: rgba(5, 7, 10, .72);
  backdrop-filter: blur(7px);
}

.panel {
  position: absolute;
  inset: 3vh 2.5vw;
  max-width: 1540px;
  margin: auto;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.09);
  border-radius: 16px;
  background: #17191f;
  box-shadow: 0 26px 90px rgba(0,0,0,.5);
}

button,
input,
select {
  font: inherit;
}

button {
  border: 1px solid rgba(255,255,255,.09);
  border-radius: 8px;
  background: #22252c;
  color: #dce0e7;
  cursor: pointer;
  transition: background .14s ease, border-color .14s ease, color .14s ease;
}

button:hover {
  background: #2a2e36;
  border-color: rgba(255,255,255,.15);
}

button:disabled {
  opacity: .42;
  cursor: default;
}

.header {
  min-height: 66px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255,255,255,.07);
  background: #181a20;
}

.brand {
  display: grid;
  gap: 3px;
  min-width: 220px;
}

.brand strong {
  font-size: 14px;
  font-weight: 720;
  letter-spacing: -.1px;
}

.brand span {
  color: #7d8593;
  font-size: 10px;
}

.header-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 7px;
}

.header-actions button {
  min-height: 34px;
  padding: 0 11px;
}

.header-actions .primary {
  border-color: #6c76f3;
  background: #5865f2;
  color: white;
}

.header-actions .primary:hover {
  background: #6671f3;
}

.icon-button {
  width: 34px;
  min-width: 34px;
  padding: 0 !important;
  font-size: 17px;
}

.filters {
  display: grid;
  grid-template-columns: minmax(260px, 1fr) 150px 150px 170px;
  gap: 8px;
  padding: 12px 16px 9px;
}

input,
select {
  width: 100%;
  height: 36px;
  border: 1px solid rgba(255,255,255,.09);
  border-radius: 8px;
  outline: none;
  background: #20232a;
  color: #e4e7ec;
  padding: 0 10px;
}

input::placeholder {
  color: #666e7b;
}

input:focus,
select:focus {
  border-color: rgba(88,101,242,.72);
}

.kinds {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  padding: 0 16px 9px;
  border-bottom: 1px solid rgba(255,255,255,.055);
  scrollbar-width: none;
}

.kinds::-webkit-scrollbar {
  display: none;
}

.kinds button {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 30px;
  padding: 0 9px;
  border-color: transparent;
  background: transparent;
  color: #8c94a1;
  font-size: 10px;
}

.kinds button:hover {
  background: #20232a;
  color: #d0d5dc;
}

.kinds button.active {
  border-color: rgba(88,101,242,.24);
  background: rgba(88,101,242,.13);
  color: #eef0ff;
}

.kinds b {
  color: #69717f;
  font-size: 9px;
  font-weight: 650;
}

.bulk {
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  border-bottom: 1px solid rgba(255,255,255,.055);
}

.bulk button {
  min-height: 30px;
  padding: 0 9px;
  font-size: 10px;
}

.bulk select {
  width: 125px;
  height: 30px;
  font-size: 10px;
}

.grow {
  flex: 1;
}

.progress {
  height: 2px;
  background: rgba(255,255,255,.04);
  overflow: hidden;
}

.progress i {
  display: block;
  width: 0;
  height: 100%;
  background: #5865f2;
  transition: width .14s linear;
}

.statusbar {
  min-height: 34px;
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 8px 16px;
  border-bottom: 1px solid rgba(255,255,255,.05);
  color: #858e9b;
  font-size: 10px;
  white-space: nowrap;
  overflow-x: auto;
}

.statusbar b {
  color: #e4e7ec;
}

.statusbar .status {
  overflow: hidden;
  text-overflow: ellipsis;
}

.grid {
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(245px, 1fr));
  align-content: start;
  gap: 12px;
  padding: 14px 16px 20px;
  scrollbar-width: thin;
  scrollbar-color: #555b66 transparent;
}

.card {
  min-width: 0;
  height: 286px;
  display: grid;
  grid-template-rows: 148px 138px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 13px;
  background: #1d2026;
  transition: border-color .14s ease, transform .14s ease;
}

.card:hover {
  border-color: rgba(255,255,255,.15);
  transform: translateY(-1px);
}

.card.selected {
  border-color: rgba(88,101,242,.86);
  box-shadow: inset 0 0 0 1px rgba(88,101,242,.16);
}

.preview {
  position: relative;
  min-width: 0;
  min-height: 0;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: #111318;
}

.preview img,
.preview video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.preview-meta {
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  gap: 5px;
  pointer-events: none;
}

.preview-meta span {
  padding: 4px 6px;
  border: 1px solid rgba(255,255,255,.09);
  border-radius: 6px;
  background: rgba(12,14,18,.8);
  color: #cbd0d8;
  font-size: 8px;
  font-weight: 650;
  backdrop-filter: blur(5px);
}

.select {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 27px;
  height: 27px;
  padding: 0;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: rgba(12,14,18,.78);
  color: white;
}

.card.selected .select {
  border-color: #6f79f4;
  background: #5865f2;
}

.card-body {
  min-width: 0;
  display: grid;
  grid-template-rows: 20px 18px 24px 32px;
  gap: 5px;
  padding: 10px;
}

.filename {
  overflow: hidden;
  color: #e8ebf0;
  font-size: 11.5px;
  font-weight: 680;
  line-height: 20px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.meta {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 5px;
  overflow: hidden;
  color: #747d8b;
  font-size: 9px;
  white-space: nowrap;
}

.meta span:first-child {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.source-row {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 5px;
  overflow: hidden;
}

.source-chip {
  flex: 0 0 auto;
  padding: 3px 6px;
  border-radius: 6px;
  background: rgba(255,255,255,.055);
  color: #9ca4b0;
  font-size: 8.5px;
}

.card-actions {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 5px;
}

.card-actions button {
  min-width: 0;
  height: 32px;
  padding: 0 5px;
  color: #b3bac5;
  font-size: 9.5px;
}

.card-actions button:hover {
  color: white;
}

.card-actions .download {
  border-color: rgba(88,101,242,.3);
  background: rgba(88,101,242,.1);
  color: #d0d4ff;
}

.file-preview {
  display: grid;
  place-items: center;
  gap: 5px;
  color: #7f8794;
  text-transform: uppercase;
}

.file-preview b {
  color: #a5acb7;
  font-size: 22px;
  letter-spacing: .06em;
}

.file-preview span {
  font-size: 8px;
  letter-spacing: .06em;
}

.font-preview b {
  font-family: Georgia, serif;
  font-size: 36px;
  font-weight: 500;
  text-transform: none;
}

.empty {
  grid-column: 1 / -1;
  min-height: 220px;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 6px;
  color: #737c89;
  text-align: center;
}

.empty strong {
  color: #c7ccd4;
  font-size: 13px;
}

.empty span {
  font-size: 10px;
}

.load-more {
  grid-column: 1 / -1;
  display: grid;
  place-items: center;
  gap: 6px;
  padding: 14px 0 4px;
}

.load-more button {
  min-width: 190px;
  min-height: 34px;
  padding: 0 12px;
}

.load-more span {
  color: #6f7886;
  font-size: 9px;
}

@media (max-width: 1000px) {
  .panel {
    inset: 2vh 2vw;
  }

  .filters {
    grid-template-columns: 1fr 1fr;
  }

  .filters input {
    grid-column: 1 / -1;
  }

  .header-actions button:not(.primary):not(.icon-button) {
    display: none;
  }
}

@media (max-width: 700px) {
  .panel {
    inset: 0;
    border-radius: 0;
  }

  .header {
    padding: 10px 12px;
  }

  .brand span {
    display: none;
  }

  .filters {
    grid-template-columns: 1fr;
    padding-left: 12px;
    padding-right: 12px;
  }

  .filters input {
    grid-column: auto;
  }

  .kinds,
  .bulk,
  .statusbar {
    padding-left: 12px;
    padding-right: 12px;
  }

  .bulk {
    flex-wrap: wrap;
  }

  .bulk .grow {
    display: none;
  }

  .grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    padding: 12px;
  }
}

@media (max-width: 520px) {
  .grid {
    grid-template-columns: 1fr;
  }

  .bulk select {
    display: none;
  }
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
            this.renderLimit = 80;
            this.renderStep = 80;
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
            this.renderShell();
            this.webpack.connect();
            await this.rescan();
        }
        renderShell() {
            document.getElementById(DAI.ROOT_ID)?.remove();
            this.root = document.createElement("div");
            this.root.id = DAI.ROOT_ID;
            this.surface = this.root.attachShadow({ mode: "open" });
            this.surface.innerHTML = `
        <style>${DAI.STYLES}</style>
        <div class="app">
          <div class="backdrop" data-action="close"></div>
          <section class="panel" role="dialog" aria-modal="true" aria-label="Discord Asset Inspector">
            <header class="header">
              <div class="brand">
                <strong>Discord Asset Inspector</strong>
                <span>v${DAI.VERSION} · yalnız Discord istemci varlıkları</span>
              </div>
              <div class="header-actions">
                <button data-action="rescan">Yeniden tara</button>
                <button class="primary" data-action="lazy">Ek paketleri tara</button>
                <button data-action="json">JSON dışa aktar</button>
                <button class="icon-button" data-action="close" aria-label="Kapat">×</button>
              </div>
            </header>

            <div class="filters">
              <input data-role="search" placeholder="Dosya adı, URL veya modül ara…" autocomplete="off" />
              <select data-role="extension"><option value="">Tüm uzantılar</option></select>
              <select data-role="source"><option value="">Tüm kaynaklar</option></select>
              <select data-role="sort">
                <option value="name">Ada göre</option>
                <option value="extension">Uzantıya göre</option>
                <option value="source">Kaynak sayısına göre</option>
                <option value="module">Modül sayısına göre</option>
              </select>
            </div>

            <nav class="kinds" aria-label="Varlık türleri">
              <button class="active" data-action="kind" data-kind="all">Tümü <b data-count-kind="all">0</b></button>
              <button data-action="kind" data-kind="image">Görseller <b data-count-kind="image">0</b></button>
              <button data-action="kind" data-kind="video">Videolar <b data-count-kind="video">0</b></button>
              <button data-action="kind" data-kind="audio">Sesler <b data-count-kind="audio">0</b></button>
              <button data-action="kind" data-kind="font">Yazı tipleri <b data-count-kind="font">0</b></button>
              <button data-action="kind" data-kind="code">Kod & veri <b data-count-kind="code">0</b></button>
              <button data-action="kind" data-kind="other">Diğer <b data-count-kind="other">0</b></button>
            </nav>

            <div class="bulk">
              <button data-action="select-visible">Görünenleri seç</button>
              <button data-action="clear-selection">Seçimi temizle</button>
              <span class="grow"></span>
              <select data-role="copy-format" aria-label="Kopyalama biçimi">
                <option value="url">URL</option>
                <option value="markdown">Markdown</option>
                <option value="css">CSS url()</option>
                <option value="html">HTML</option>
              </select>
              <button data-action="copy-selected" disabled>Seçilenleri kopyala</button>
            </div>

            <div class="progress"><i data-role="progress"></i></div>

            <div class="statusbar">
              <span><b data-role="count">0</b> görünür</span>
              <span><b data-role="selected-count">0</b> seçili</span>
              <span><b data-role="source-count">0</b> kaynak türü</span>
              <span class="status" data-role="status">Hazır</span>
            </div>

            <main class="grid" data-role="grid"></main>
          </section>
        </div>
      `;
            document.body.appendChild(this.root);
            this.grid = this.must("[data-role=grid]");
            this.countEl = this.must("[data-role=count]");
            this.selectedCountEl = this.must("[data-role=selected-count]");
            this.sourceCountEl = this.must("[data-role=source-count]");
            this.statusEl = this.must("[data-role=status]");
            this.progressEl = this.must("[data-role=progress]");
            this.searchEl = this.must("[data-role=search]");
            this.extensionEl = this.must("[data-role=extension]");
            this.sourceEl = this.must("[data-role=source]");
            this.sortEl = this.must("[data-role=sort]");
            this.copyFormatEl = this.must("[data-role=copy-format]");
            this.copySelectedButton = this.must("[data-action=copy-selected]");
            this.lazyButton = this.must("[data-action=lazy]");
            const refresh = DAI.debounce(() => this.resetRenderWindow(), 120);
            this.searchEl.addEventListener("input", refresh);
            this.extensionEl.addEventListener("change", () => this.resetRenderWindow());
            this.sourceEl.addEventListener("change", () => this.resetRenderWindow());
            this.sortEl.addEventListener("change", () => this.resetRenderWindow());
            this.surface.addEventListener("click", event => void this.handleClick(event));
            document.addEventListener("keydown", this.onKeydown, true);
        }
        must(selector) {
            const element = this.surface.querySelector(selector);
            if (!element)
                throw new Error("Eksik arayüz öğesi: " + selector);
            return element;
        }
        async handleClick(event) {
            const button = event.target.closest("[data-action]");
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
                this.surface.querySelectorAll(".kinds button").forEach(item => {
                    item.classList.toggle("active", item === button);
                });
                this.resetRenderWindow();
                return;
            }
            if (action === "select-visible") {
                this.visible.slice(0, this.renderLimit).forEach(item => this.selected.add(item.url));
                this.applyFilters();
                return;
            }
            if (action === "clear-selection") {
                this.selected.clear();
                this.applyFilters();
                return;
            }
            if (action === "copy-selected") {
                const items = this.registry.values().filter(item => this.selected.has(item.url));
                if (!items.length)
                    return;
                const format = this.copyFormatEl.value;
                await DAI.copyText(items.map(item => DAI.formatCopy(item, format)).join("\n"));
                this.setStatus(`${items.length} varlık kopyalandı.`);
                return;
            }
            if (action === "load-more") {
                this.renderLimit += this.renderStep;
                this.renderCards();
                return;
            }
            const card = button.closest(".card");
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
                return;
            }
            if (action === "open") {
                window.open(url, "_blank", "noopener,noreferrer");
                return;
            }
            if (action === "download") {
                await this.downloadAsset(url);
            }
        }
        async rescan() {
            if (this.closed)
                return;
            this.registry.clear();
            this.selected.clear();
            this.renderLimit = this.renderStep;
            this.setStatus("Discord istemci varlıkları taranıyor…");
            this.webpack.connect();
            const reports = [
                DAI.scanPerformance(this.registry),
                DAI.scanCss(this.registry),
                this.webpack.scanLoadedModules()
            ];
            this.rebuildFilters();
            this.applyFilters();
            const skipped = reports.reduce((sum, report) => sum + (report.skippedAssets || 0), 0);
            this.setStatus(`Tarama tamamlandı · ${this.registry.size()} istemci varlığı · ${skipped} ham paket girdisi atlandı.`);
        }
        async scanLazy() {
            if (this.closed || this.lazyButton.disabled)
                return;
            this.lazyButton.disabled = true;
            this.setProgress(0);
            this.setStatus("Ek Discord paketleri taranıyor…");
            try {
                const report = await this.webpack.scanLazyResources(this.abortController.signal, (done, total) => {
                    this.setProgress(total ? (done / total) * 100 : 0);
                    this.setStatus(`Ek paketler taranıyor · ${done}/${total}`);
                });
                this.rebuildFilters();
                this.applyFilters();
                this.setStatus(`Ek tarama tamamlandı · ${report.added} yeni varlık · ${report.skippedAssets || 0} ham giriş atlandı · ${report.failedResources || 0} başarısız.`);
            }
            finally {
                this.setProgress(0);
                this.lazyButton.disabled = false;
            }
        }
        rebuildFilters() {
            const previousExtension = this.extensionEl.value;
            const previousSource = this.sourceEl.value;
            const extensions = [...new Set(this.registry.values().map(item => item.extension))].sort();
            const sources = [...new Set(this.registry.values().flatMap(item => [...item.sources]))].sort();
            this.extensionEl.innerHTML =
                '<option value="">Tüm uzantılar</option>' +
                    extensions.map(value => `<option value="${DAI.escapeHtml(value)}">${DAI.escapeHtml(value.toUpperCase())}</option>`).join("");
            this.sourceEl.innerHTML =
                '<option value="">Tüm kaynaklar</option>' +
                    sources.map(value => `<option value="${DAI.escapeHtml(value)}">${DAI.escapeHtml(DAI.sourceLabel(value))}</option>`).join("");
            if (extensions.includes(previousExtension))
                this.extensionEl.value = previousExtension;
            if (sources.includes(previousSource))
                this.sourceEl.value = previousSource;
        }
        resetRenderWindow() {
            this.renderLimit = this.renderStep;
            this.applyFilters();
        }
        applyFilters() {
            const query = this.searchEl.value.trim().toLowerCase();
            const extension = this.extensionEl.value;
            const source = this.sourceEl.value;
            const sort = this.sortEl.value;
            this.visible = this.registry.values().filter(item => {
                if (this.kind !== "all" && DAI.assetKind(item.extension) !== this.kind)
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
            this.renderKindCounts();
            this.renderCards();
            this.countEl.textContent = String(this.visible.length);
            this.selectedCountEl.textContent = String(this.selected.size);
            this.sourceCountEl.textContent = String(new Set(this.registry.values().flatMap(item => [...item.sources])).size);
            this.copySelectedButton.disabled = this.selected.size === 0;
            this.copySelectedButton.textContent = this.selected.size
                ? `Seçilenleri kopyala (${this.selected.size})`
                : "Seçilenleri kopyala";
        }
        renderKindCounts() {
            const counts = {
                all: 0,
                image: 0,
                video: 0,
                audio: 0,
                font: 0,
                code: 0,
                other: 0
            };
            for (const item of this.registry.values()) {
                counts.all++;
                counts[DAI.assetKind(item.extension)]++;
            }
            for (const [kind, count] of Object.entries(counts)) {
                const element = this.surface.querySelector(`[data-count-kind="${kind}"]`);
                if (element)
                    element.textContent = String(count);
            }
        }
        renderCards() {
            if (!this.visible.length) {
                this.grid.innerHTML = `
          <div class="empty">
            <strong>Varlık bulunamadı</strong>
            <span>Filtreleri değiştir veya yeniden tara.</span>
          </div>
        `;
                return;
            }
            const limit = Math.min(this.renderLimit, this.visible.length);
            const cards = this.visible.slice(0, limit).map(item => this.cardHtml(item)).join("");
            const remaining = this.visible.length - limit;
            this.grid.innerHTML = cards + (remaining > 0
                ? `<div class="load-more">
             <button data-action="load-more">Daha fazla göster (+${Math.min(this.renderStep, remaining)})</button>
             <span>${limit} / ${this.visible.length}</span>
           </div>`
                : "");
        }
        cardHtml(item) {
            const selected = this.selected.has(item.url);
            const kind = DAI.assetKind(item.extension);
            const sources = [...item.sources].slice(0, 2);
            const sourceHtml = sources.map(source => `<span class="source-chip">${DAI.escapeHtml(DAI.sourceLabel(source))}</span>`).join("");
            return `
        <article class="card${selected ? " selected" : ""}" data-url="${DAI.escapeHtml(item.url)}">
          <div class="preview">
            ${this.previewHtml(item)}
            <div class="preview-meta">
              <span>${DAI.escapeHtml(DAI.assetKindLabel(kind))}</span>
              <span>${DAI.escapeHtml(item.extension.toUpperCase())}</span>
            </div>
            <button
              class="select"
              data-action="toggle-select"
              aria-label="${selected ? "Seçimi kaldır" : "Seç"}"
              aria-pressed="${selected}"
            >${selected ? "✓" : ""}</button>
          </div>

          <div class="card-body">
            <div class="filename" title="${DAI.escapeHtml(item.name)}">${DAI.escapeHtml(item.name)}</div>
            <div class="meta" title="${DAI.escapeHtml(item.url)}">
              <span>${DAI.escapeHtml(this.host(item.url))}</span>
              <span>•</span>
              <span>${item.modules.size ? `${item.modules.size} modül` : "yüklenmiş kaynak"}</span>
            </div>

            <div class="source-row">${sourceHtml}</div>

            <div class="card-actions">
              <button data-action="copy">Kopyala</button>
              <button data-action="open">Aç</button>
              <button class="download" data-action="download">İndir</button>
            </div>
          </div>
        </article>
      `;
        }
        previewHtml(item) {
            const url = DAI.escapeHtml(item.url);
            if (DAI.IMAGE_EXTENSIONS.has(item.extension)) {
                return `<img loading="lazy" decoding="async" src="${url}" alt="" />`;
            }
            if (DAI.VIDEO_EXTENSIONS.has(item.extension)) {
                return `<video preload="metadata" muted src="${url}"></video>`;
            }
            if (DAI.AUDIO_EXTENSIONS.has(item.extension)) {
                return '<div class="file-preview"><b>♪</b><span>Ses</span></div>';
            }
            if (DAI.FONT_EXTENSIONS.has(item.extension)) {
                return '<div class="file-preview font-preview"><b>Aa</b><span>Yazı tipi</span></div>';
            }
            if (DAI.CODE_EXTENSIONS.has(item.extension)) {
                return `<div class="file-preview"><b>&lt;/&gt;</b><span>${DAI.escapeHtml(item.extension.toUpperCase())}</span></div>`;
            }
            return `<div class="file-preview"><b>FILE</b><span>${DAI.escapeHtml(item.extension.toUpperCase())}</span></div>`;
        }
        host(url) {
            try {
                return new URL(url, location.href).hostname.replace(/^cdn\./, "");
            }
            catch {
                return "discord";
            }
        }
        async downloadAsset(url) {
            try {
                const response = await fetch(url, {
                    method: "GET",
                    cache: "force-cache",
                    credentials: "same-origin",
                    signal: this.abortController.signal
                });
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
            this.statusEl.textContent = text;
        }
        setProgress(value) {
            this.progressEl.style.width = `${Math.max(0, Math.min(100, value))}%`;
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
