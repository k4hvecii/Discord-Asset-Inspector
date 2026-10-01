namespace DAI {
  let instance: InspectorApp | null = null;

  function open(): InspectorApp {
    if (instance) return instance;
    instance = new InspectorApp(() => { instance = null; });
    void instance.start();
    return instance;
  }

  function close(): void {
    instance?.close();
  }

  function toggle(): void {
    if (instance) close();
    else open();
  }

  const previousDispose = (window as any).__discordAssetInspectorDispose as undefined | (() => void);
  previousDispose?.();

  const onShortcut = (event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && !event.altKey && event.code === "KeyK") {
      event.preventDefault();
      event.stopImmediatePropagation();
      toggle();
    }
  };

  window.addEventListener("keydown", onShortcut, true);

  (window as any).__DISCORD_ASSET_INSPECTOR__ = {
    version: VERSION,
    open,
    close,
    toggle,
    rescan: () => instance?.rescan(),
    assets: () => instance?.registry.serialize() || []
  };

  (window as any).__discordAssetInspectorDispose = () => {
    window.removeEventListener("keydown", onShortcut, true);
    close();
    delete (window as any).__DISCORD_ASSET_INSPECTOR__;
    delete (window as any).__discordAssetInspectorDispose;
  };

  open();
}
