/**
 * @name DiscordAssetInspector
 * @author K4hveci
 * @description Browse and inspect assets loaded by Discord from a local BetterDiscord panel.
 * @version 0.3.0
 * @website https://github.com/k4hvecii/Discord-Asset-Inspector
 * @source https://github.com/k4hvecii/Discord-Asset-Inspector/blob/main/plugins/betterdiscord/DiscordAssetInspector.plugin.js
 */

declare const module: any;

class DiscordAssetInspectorPlugin {
  private app: DAI.InspectorApp | null = null;
  private started = false;

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

    const api = (globalThis as any).BdApi;
    api?.UI?.showToast?.("Asset Inspector ready · Ctrl/Cmd + Shift + K", {
      type: "success",
      timeout: 3500
    });
  }

  stop(): void {
    if (!this.started) return;
    this.started = false;
    window.removeEventListener("keydown", this.onShortcut, true);
    this.close();
    document.getElementById(DAI.ROOT_ID)?.remove();
  }

  private open(): void {
    if (this.app) return;
    this.app = new DAI.InspectorApp(() => {
      this.app = null;
    });
    void this.app.start();
  }

  private close(): void {
    this.app?.close();
    this.app = null;
  }

  private toggle(): void {
    if (this.app) this.close();
    else this.open();
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
      if (!this.app) this.open();
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
