namespace DAI {
  export type AssetSource =
    | "performance"
    | "css"
    | "webpack"
    | "lazy-js"
    | "lazy-css";

  export type AssetKind = "image" | "video" | "audio" | "font" | "code" | "other";
  export type CopyFormat = "url" | "markdown" | "css" | "html";

  export interface AssetRecord {
    url: string;
    name: string;
    extension: string;
    sources: Set<AssetSource>;
    modules: Set<string>;
  }

  export interface SerializedAsset {
    url: string;
    name: string;
    extension: string;
    kind: AssetKind;
    sources: AssetSource[];
    modules: string[];
  }

  export interface WebpackRuntime {
    m?: Record<string, Function>;
    p?: string;
    u?: (id: string | number) => string;
    miniCssF?: (id: string | number) => string;
  }

  export interface ScanReport {
    added: number;
    scannedModules?: number;
    scannedResources?: number;
    discoveredChunks?: number;
    failedResources?: number;
    skippedAssets?: number;
  }
}
