namespace DAI {
  export type AssetSource =
    | "webpack"
    | "lazy-js"
    | "lazy-css"
    | "dom"
    | "performance"
    | "css"
    | "cache";

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
  }
}
