<div align="center">

# Discord Asset Inspector

A privacy-conscious asset inspection utility for the Discord desktop client.

**BetterDiscord plugin · Standalone build · No token access · No telemetry**

[Download BetterDiscord plugin](https://github.com/k4hvecii/Discord-Asset-Inspector/raw/refs/heads/main/plugins/betterdiscord/DiscordAssetInspector.plugin.js)

</div>

## Quick start — BetterDiscord

The easiest way to use Discord Asset Inspector is the BetterDiscord plugin.

1. Install BetterDiscord.
2. Download `plugins/betterdiscord/DiscordAssetInspector.plugin.js` from this repository.
3. Put the file in your BetterDiscord plugins folder.
4. Open Discord → Settings → BetterDiscord → Plugins.
5. Enable **Discord Asset Inspector**.
6. Open it from the small Asset Inspector button in Discord's top channel toolbar, from plugin settings, or with `Ctrl/Cmd + Shift + K`.

Default BetterDiscord plugin folders:

```text
Windows: %appdata%\BetterDiscord\plugins
macOS:   ~/Library/Application Support/BetterDiscord/plugins
Linux:   ~/.config/BetterDiscord/plugins
```

The plugin is a single JavaScript file and has no runtime dependencies.

> BetterDiscord is a third-party client modification and is not affiliated with this project or Discord Inc.

## What it does

Discord Asset Inspector opens a local overlay inside the Discord desktop client and collects asset URLs from several client-visible sources:

- loaded Webpack module source text
- DOM elements
- CSS rules
- Performance Resource Timing
- browser Cache Storage
- optional Discord-owned lazy JavaScript/CSS resources, fetched and scanned as text without executing the discovered chunks

The interface is organized as a small asset library with type tabs for images, video, audio, fonts, code/data and other files. By default it focuses on Discord client assets and filters runtime user content such as avatars, emojis, stickers and attachments. The **Kullanıcı içeriği** toggle can explicitly include those resources when needed. It supports search, extension/source filters, module/source sorting, multi-select, selected-only view, URL/Markdown/CSS/HTML copy formats, individual open/save actions and JSON export.

## v0.3 workflow

The default mode now rebuilds a clean client-asset registry on each rescan. Runtime user content and stale cache entries are excluded unless broad user-content mode is explicitly enabled.

The main workflow is now:

```text
Scan → filter by type/source → select assets → copy/open/save
```

Selection stays local to the open inspector. The plugin does not upload or synchronize inspected resources.

## Standalone usage

A standalone console build is still available for developers who do not use BetterDiscord.

1. Open `dist/discord-asset-inspector.js`.
2. Review and copy the complete file.
3. Open Discord Desktop developer tools and switch to Console.
4. Paste the script and press Enter.

The inspector opens immediately. Toggle it with `Ctrl/Cmd + Shift + K`.

Console API:

```js
__DISCORD_ASSET_INSPECTOR__.open()
__DISCORD_ASSET_INSPECTOR__.close()
__DISCORD_ASSET_INSPECTOR__.toggle()
__DISCORD_ASSET_INSPECTOR__.rescan()
__DISCORD_ASSET_INSPECTOR__.assets()
```

## Build

```bash
npm install
npm run check
npm run build
```

Build outputs:

```text
dist/discord-asset-inspector.js
plugins/betterdiscord/DiscordAssetInspector.plugin.js
```

## Project structure

```text
src/
├─ core/
├─ scanners/
├─ ui/
├─ betterdiscord.ts
└─ index.ts

plugins/
└─ betterdiscord/
   └─ DiscordAssetInspector.plugin.js

dist/
└─ discord-asset-inspector.js
```

Both distributions use the same scanner and UI source code.

## Security model

The project intentionally avoids authentication/session inspection. It contains no token lookup, cookie lookup, telemetry, webhook sender or mutation requests. Lazy scanning is restricted to same-origin or Discord-owned hosts and uses GET requests only.

The BetterDiscord edition only uses the official `BdApi.UI` surface for its enable toast; the inspector itself remains local to the client.

See `SECURITY.md` for details.

## Limitations

Discord's client and Webpack internals are private implementation details and can change at any time. A Discord update may therefore require scanner adjustments.

Some resources can also be unavailable because of CORS, cache state, account/client experiments or because that part of the client has never been loaded.

## License

MIT © 2026 K4hveci

Discord is a trademark of Discord Inc. This project is independent and is not affiliated with or endorsed by Discord Inc.
