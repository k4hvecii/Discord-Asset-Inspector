# Security

Discord Asset Inspector is designed as a local inspection utility.

## What the project does

- Reads loaded Webpack module source text.
- Reads DOM, stylesheet, Performance Resource Timing and Cache Storage URLs.
- Fetches discovered Discord-owned lazy JS/CSS resources as text when the user explicitly requests a lazy scan.
- Fetches an asset when the user explicitly chooses to save it.
- In the BetterDiscord edition, uses the official `BdApi.UI.showToast` API to show the enable notification.

## What the project intentionally does not do

- It does not read Discord authentication tokens.
- It does not read cookies.
- It does not send analytics or telemetry.
- It does not use webhooks.
- It does not issue POST, PUT, PATCH or DELETE requests.
- It does not execute discovered lazy chunks.
- It does not persist BetterDiscord account/session data.
- It does not use Node.js `child_process`.

Always review client-modification code before running it. Discord and BetterDiscord internals can change without notice.
