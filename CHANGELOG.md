# Changelog

## 0.4.1 - 2026-10-04

- Added client-only filtering as the default scan mode.
- Filters Discord avatars, bot/app icons, emojis, stickers, banners, attachments, role icons and profile decorations from normal results.
- Runtime DOM, Performance and Cache scans now keep only likely Discord client assets by default.
- Added a **Kullanıcı içeriği** toggle for explicitly including runtime user content when needed.
- Turning the toggle off prunes user-content results from the active registry.


## 0.4.0 - 2026-10-04

- Reworked the asset card layout for a cleaner media-library feel.
- Moved type and extension labels onto the preview area.
- Replaced the large selection control with a compact circular selector.
- Replaced the full URL line with a cleaner host and module summary.
- Reduced source-chip clutter and grouped card actions into a consistent footer.
- Improved card spacing, responsive grid sizing and visual hierarchy.


## 0.3.2 - 2026-10-04

- Added a small Asset Inspector button to Discord's top channel toolbar.
- Toolbar button toggles the inspector open and closed.
- Added active-state feedback while the inspector is open.
- Reattaches the launcher after Discord navigation changes.
- Throttled toolbar observation to avoid unnecessary DOM work.


## 0.3.1 - 2026-10-04

- Fixed malformed escaped newlines in the injected stylesheet that collapsed asset cards.
- Restored full card layout, previews and action controls.
- Localized the BetterDiscord interface and plugin settings to Turkish.
- Added Turkish labels for asset categories and scanner sources.


## 0.3.0 - 2026-10-04

- Added image, video, audio, font, code/data and other asset categories.
- Added multi-select, select-visible, clear-selection and selected-only workflows.
- Added URL, Markdown, CSS and HTML copy formats.
- Added module-count sorting and category counters.
- Refined asset cards and responsive controls for BetterDiscord use.
- Kept the scanner local-only and dependency-free at runtime.


## 0.2.0 - 2026-10-01

- Added a single-file BetterDiscord plugin distribution.
- Added BetterDiscord plugin settings with **Open Asset Inspector** and **Rescan** actions.
- Added Ctrl/Cmd + Shift + K as the shared toggle shortcut.
- Kept the standalone console build for developer use.
- Added separate TypeScript build/check targets for standalone and BetterDiscord distributions.
- Updated documentation with a user-first BetterDiscord installation flow.

## 0.1.0 - 2026-10-01

- Initial public foundation.
- Loaded Webpack module inspection.
- DOM, CSS, Performance and Cache Storage scanners.
- Optional lazy JS/CSS resource text scanning without chunk execution.
- Search, extension/source filters and sorting.
- Image/video previews.
- URL copy, open, save and JSON export.
- Abortable network work and clean teardown.
