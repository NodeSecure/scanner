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

export interface ScannedFilesResult {
  composition: TarballComposition;
  conformance: conformance.SpdxExtractedResult;
  code: SourceCodeReport;
}

export class NpmTarball {
  static JS_EXTENSIONS = new Set([
    ".js", ".mjs", ".cjs"
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
      const astAnalyser = new AstAnalyser(astAnalyserOptions);

      code = await new SourceCodeScanner(this.manifest, { astAnalyser }).iterate({
        manifest: [...this.manifest.getEntryFiles()]
          .flatMap(filterJavaScriptFiles()),
        javascript: composition.files
          .flatMap(filterJavaScriptFiles())
      });
    }

    return {
      conformance: spdx,
      composition,
      code
    };
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
