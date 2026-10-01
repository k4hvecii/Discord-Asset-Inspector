import { readFile, writeFile } from "node:fs/promises";

const file = "plugins/betterdiscord/DiscordAssetInspector.plugin.js";
let source = await readFile(file, "utf8");

source = source.replace(/^["']use strict["'];\s*/, "");

if (!source.startsWith("/**")) {
  throw new Error("BetterDiscord metadata header is not the first content in the generated plugin.");
}

await writeFile(file, source, "utf8");
