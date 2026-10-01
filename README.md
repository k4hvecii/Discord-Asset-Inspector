<div align="center">

# Discord Asset Inspector

A small, privacy-conscious developer utility for inspecting assets already exposed to the Discord desktop client.

**No token access · No telemetry · No external dependencies at runtime**

</div>

## What it does

Discord Asset Inspector opens a local overlay inside the Discord desktop client and collects asset URLs from several client-visible sources:

- loaded Webpack module source text
- DOM elements
- CSS rules
- Performance Resource Timing
- browser Cache Storage
- optional Discord-owned lazy JavaScript/CSS resources, fetched and scanned as text without executing the discovered chunks

The interface supports search, extension/source filters, sorting, image/video previews, URL copying, opening/saving individual assets and JSON export.

## Why this project exists

This project is an independent implementation built from scratch for client-side development and UI/resource inspection. It is not a fork of another asset explorer and does not include third-party source code.

## Usage

1. Build the project or use `dist/discord-asset-inspector.js`.
2. Open Discord Desktop developer tools.
3. Open the Console tab.
4. Review the script, paste it into the console and press Enter.

The inspector opens immediately. Toggle it with:

```text
Ctrl + Shift + I
```

On macOS use `Cmd + Shift + I`.

You can also control the running instance from the console:

```js
__DISCORD_ASSET_INSPECTOR__.open()
__DISCORD_ASSET_INSPECTOR__.close()
__DISCORD_ASSET_INSPECTOR__.toggle()
__DISCORD_ASSET_INSPECTOR__.rescan()
__DISCORD_ASSET_INSPECTOR__.assets()
```

## Build

TypeScript is the only development dependency.

```bash
npm install
npm run check
npm run build
```

The browser-ready single-file build is written to:

```text
dist/discord-asset-inspector.js
```

## Project structure

```text
src/
├─ core/
│  ├─ constants.ts
│  ├─ registry.ts
│  ├─ types.ts
│  └─ utils.ts
├─ scanners/
│  ├─ cache.ts
│  ├─ css.ts
│  ├─ dom.ts
│  ├─ performance.ts
│  └─ webpack.ts
├─ ui/
│  ├─ app.ts
│  └─ styles.ts
└─ index.ts
```

## Security model

The project intentionally avoids authentication/session inspection. It contains no token lookup, cookie lookup, telemetry, webhook sender or mutation requests. Lazy scanning is restricted to same-origin or Discord-owned hosts and uses GET requests only.

See `SECURITY.md` for the exact behavior.

## Limitations

Discord's client and Webpack internals are private implementation details and can change at any time. A Discord update may therefore require scanner adjustments.

Some resources can also be unavailable because of CORS, cache state, account/client experiments or because that part of the client has never been loaded.

## License

MIT © 2026 K4hveci

Discord is a trademark of Discord Inc. This project is independent and is not affiliated with or endorsed by Discord Inc.
