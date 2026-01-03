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
  CollectableSet,
  warnings,
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
import { DnsResolver } from "./DnsResolver.class.ts";

export interface ScannedFilesResult {
  composition: TarballComposition;
  conformance: conformance.SpdxExtractedResult;
  code: SourceCodeReport;
}

export class NpmTarball {
  static JS_EXTENSIONS = new Set([
    ".js", ".mjs", ".cjs",
    ".ts", ".mts", ".cts",
    ".jsx", ".tsx"
  ]);

  manifest: LocatedManifestManager;

  constructor(
    mama: ManifestManager
  ) {
    if (!ManifestManager.isLocated(mama)) {
      throw new Error("ManifestManager must have a location");
    }

    this.manifest = mama;
  }

  async scanFiles(
    astAnalyserOptions?: AstAnalyserOptions
  ): Promise<ScannedFilesResult> {
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
      const options = this.#optionsWithHostnameSet(astAnalyserOptions ?? {});

      const hostNameSet = options?.collectables?.find((collectable) => collectable.type === "hostname")!;

      const astAnalyser = new AstAnalyser(options);

      code = await new SourceCodeScanner(this.manifest, { astAnalyser }).iterate({
        manifest: [...this.manifest.getEntryFiles()]
          .flatMap(filterJavaScriptFiles()),
        javascript: composition.files
          .flatMap(filterJavaScriptFiles())
      });

      const dns = new DnsResolver();
      const operationQueue =
        Array.from(hostNameSet).flatMap(({ value, locations }) => locations.map(({ file, location }) => dns.isPrivateHost(value)
          .then((isPrivate) => {
            if (isPrivate) {
              code.warnings.push({
                kind: "shady-link",
                ...warnings["shady-link"],
                file: file ?? undefined,
                location,
                value,
                source: "Scanner"
              });
            }
          })
        )
        );
      await Promise.allSettled(operationQueue);
    }

    return {
      conformance: spdx,
      composition,
      code
    };
  }

  #optionsWithHostnameSet(options: AstAnalyserOptions): AstAnalyserOptions {
    const hasHostnameSet = options?.collectables?.some((collectable) => collectable.type === "hostname");
    if (hasHostnameSet) {
      return options;
    }

    return { ...options, collectables: [...options.collectables ?? [], new CollectableSet("hostname")] };
  }
}

function filterJavaScriptFiles() {
  return (file: string) => {
    if (NpmTarball.JS_EXTENSIONS.has(path.extname(file))) {
      return file;
    }

    return [];
  };
}
