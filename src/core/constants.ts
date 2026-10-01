namespace DAI {
  export const VERSION = "0.1.0";
  export const ROOT_ID = "__discord_asset_inspector__";

  export const EXTENSIONS = new Set([
    "png", "jpg", "jpeg", "webp", "gif", "apng", "avif", "bmp", "svg", "ico", "tiff",
    "mp4", "webm", "mov", "m4v", "ogv", "mkv", "m3u8",
    "mp3", "ogg", "wav", "m4a", "aac", "flac", "opus", "weba",
    "woff", "woff2", "ttf", "otf", "eot", "ttc",
    "json", "wasm", "css", "js", "xml", "txt", "webmanifest", "lottie", "rlottie",
    "pdf", "vtt", "glsl", "rive"
  ]);

  export const IMAGE_EXTENSIONS = new Set([
    "png", "jpg", "jpeg", "webp", "gif", "apng", "avif", "bmp", "svg", "ico", "tiff"
  ]);

  export const VIDEO_EXTENSIONS = new Set(["mp4", "webm", "mov", "m4v", "ogv"]);
  export const AUDIO_EXTENSIONS = new Set(["mp3", "ogg", "wav", "m4a", "aac", "flac", "opus", "weba"]);
  export const FONT_EXTENSIONS = new Set(["woff", "woff2", "ttf", "otf", "eot", "ttc"]);

  export const DISCORD_HOST_SUFFIXES = [
    "discord.com",
    "discordapp.com",
    "discordapp.net",
    "discord.media"
  ];
}
