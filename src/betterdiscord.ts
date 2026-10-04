/**
 * @name DiscordAssetInspector
 * @author K4hveci
 * @description Discord tarafından yüklenen varlıkları yerel BetterDiscord panelinden inceleyin.
 * @version 0.5.0
 * @website https://github.com/k4hvecii/Discord-Asset-Inspector
 * @source https://github.com/k4hvecii/Discord-Asset-Inspector/blob/main/plugins/betterdiscord/DiscordAssetInspector.plugin.js
 */

declare const module: any;

class DiscordAssetInspectorPlugin {
  private app: DAI.InspectorApp | null = null;
  private started = false;
  private launcher: HTMLButtonElement | null = null;
  private launcherObserver: MutationObserver | null = null;
  private launcherStyle: HTMLStyleElement | null = null;
  private launcherMountTimer = 0;

  private readonly onShortcut = (event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && !event.altKey && event.code === "KeyK") {
      event.preventDefault();
      event.stopImmediatePropagation();
      this.toggle();
    }
  };

  start(): void {
    if (this.started) return;
    this.started = true;
    window.addEventListener("keydown", this.onShortcut, true);
    this.startLauncher();

    const api = (globalThis as any).BdApi;
    api?.UI?.showToast?.("Asset Inspector hazır · Ctrl/Cmd + Shift + K", {
      type: "success",
      timeout: 3500
    });
  }

  stop(): void {
    if (!this.started) return;
    this.started = false;
    window.removeEventListener("keydown", this.onShortcut, true);
    this.stopLauncher();
    this.close();
    document.getElementById(DAI.ROOT_ID)?.remove();
  }

  private open(): void {
    if (this.app) return;
    this.app = new DAI.InspectorApp(() => {
      this.app = null;
      this.updateLauncherState();
    });
    this.updateLauncherState();
    void this.app.start();
  }

  private close(): void {
    this.app?.close();
    this.app = null;
    this.updateLauncherState();
  }

  private toggle(): void {
    if (this.app) this.close();
    else this.open();
  }

  private startLauncher(): void {
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

  private stopLauncher(): void {
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

  private findToolbar(): HTMLElement | null {
    const candidates = Array.from(
      document.querySelectorAll<HTMLElement>('[class*="upperContainer_"] [class*="toolbar_"]')
    );

    return candidates.find(element => {
      if (element.closest("#" + DAI.ROOT_ID)) return false;
      const rect = element.getBoundingClientRect();
      return rect.width > 80 && rect.height > 20 && rect.height < 70;
    }) || null;
  }

  private mountLauncher(): void {
    const toolbar = this.findToolbar();
    if (!toolbar) return;

    const current = document.getElementById("__discord_asset_inspector_launcher__") as HTMLButtonElement | null;
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

  private updateLauncherState(): void {
    if (!this.launcher?.isConnected) return;
    const open = Boolean(this.app);
    this.launcher.setAttribute("aria-pressed", String(open));
    this.launcher.title = open ? "Asset Inspector'ı Kapat" : "Asset Inspector'ı Aç";
    this.launcher.setAttribute("aria-label", this.launcher.title);
  }

  getSettingsPanel(): HTMLElement {
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
      if (!this.app) this.open();
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
