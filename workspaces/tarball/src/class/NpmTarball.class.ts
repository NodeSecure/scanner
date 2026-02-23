// Import Node.js Dependencies
import path from "node:path";

// Import Third-party Dependencies
import * as conformance from "@nodesecure/conformance";
import {
  ManifestManager,
  type LocatedManifestManager
} from "@nodesecure/mama";
import {
  AstAnalyser,
  DefaultCollectableSet,
  warnings,
  TsSourceParser,
  type AstAnalyserOptions
} from "@nodesecure/js-x-ray";

// Import Internal Dependencies
import {
  SourceCodeReport,
  SourceCodeScanner
} from "./SourceCodeScanner.class.ts";
import {
  getTarballComposition,
  type TarballComposition
} from "../utils/index.ts";
import { type Resolver, DnsResolver } from "./DnsResolver.class.ts";

export interface ScannedFilesResult {
  composition: TarballComposition;
  conformance: conformance.SpdxExtractedResult;
  code: SourceCodeReport;
}

export interface NpmTarballScanFilesOptions {
  /**
   * List of files and directories to exclude from the scan.
   * Support glob patterns (e.g., "node_modules/**", "dist/**")
   */
  exclude?: string[];
}

export type NpmTarballOptions = {
  resolver?: Resolver;
};

export class NpmTarball {
  static JS_EXTENSIONS = new Set([
    ".js", ".mjs", ".cjs",
    ".ts", ".mts", ".cts",
    ".jsx", ".tsx"
  ]);

  manifest: LocatedManifestManager;
  #resolver: Resolver;

  constructor(
    mama: ManifestManager,
    options: NpmTarballOptions = {}
  ) {
    if (!ManifestManager.isLocated(mama)) {
      throw new Error("ManifestManager must have a location");
    }

    this.manifest = mama;
    this.#resolver = options?.resolver ?? new DnsResolver();
  }

  async scanFiles(
    astAnalyserOptions?: AstAnalyserOptions,
    options: NpmTarballScanFilesOptions = {}
  ): Promise<ScannedFilesResult> {
    const { exclude = [] } = options;

    const location = this.manifest.location;
    const [
      composition,
      spdx
    ] = await Promise.all([
      getTarballComposition(location),
      conformance.extractLicenses(location)
    ]);

    let code: SourceCodeReport;
    if (composition.files.length === 1 && composition.files.includes("package.json")) {
      code = new SourceCodeReport();
    }
    else {
      const options = this.#optionsWithHostnameSet(
        astAnalyserOptions ?? {}
      );

      const hostNameSet = options?.collectables?.find(
        (collectable) => collectable.type === "hostname"
      )!;

      const astAnalyser = new AstAnalyser(options);

      code = await new SourceCodeScanner(this.manifest, { astAnalyser }).iterate({
        manifest: [...this.manifest.getEntryFiles()]
          .flatMap(filterJavaScriptFiles(exclude)),
        javascript: composition.files
          .flatMap(filterJavaScriptFiles(exclude))
      });

      if (hostNameSet instanceof DefaultCollectableSet) {
        const operationQueue =
          Array.from(hostNameSet)
            .map(({ value, locations }) => this.#resolver.isPrivateHost(value)
              .then((isPrivate) => {
                if (isPrivate) {
                  locations.forEach(({ file, location }) => {
                    code.warnings.push({
                      kind: "shady-link",
                      ...warnings["shady-link"],
                      file: file ?? undefined,
                      location,
                      value,
                      source: "Scanner"
                    });
                  });
                }
              })
            );
        await Promise.allSettled(operationQueue);
      }
    }

    return {
      conformance: spdx,
      composition,
      code
    };
  }

  #optionsWithHostnameSet(
    options: AstAnalyserOptions
  ): AstAnalyserOptions {
    const hasHostnameSet = options?.collectables?.some(
      (collectable) => collectable.type === "hostname"
    );
    if (hasHostnameSet) {
      return options;
    }

    return {
      ...options,
      collectables: [
        ...options.collectables ?? [],
        new DefaultCollectableSet("hostname")
      ]
    };
  }
}

function filterJavaScriptFiles(
  exclude: string[] = []
) {
  return (file: string) => {
    // Exclude .d.ts files
    if (file.includes("d.ts")) {
      return [];
    }

    // Exclude files matching any glob pattern
    if (exclude.some((pattern) => path.matchesGlob(file, pattern))) {
      return [];
    }

    const fileExt = path.extname(file);

    if (NpmTarball.JS_EXTENSIONS.has(fileExt)) {
      return file;
    }
    if (TsSourceParser.FileExtensions.has(fileExt)) {
      return file;
    }

    return [];
  };
}
