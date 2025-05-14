// Import Node.js Dependencies
import path from "node:path";

// Import Third-party Dependencies
import * as conformance from "@nodesecure/conformance";
import {
  ManifestManager,
  type LocatedManifestManager
} from "@nodesecure/mama";

// Import Internal Dependencies
import {
  SourceCodeReport,
  SourceCodeScanner
} from "./SourceCodeScanner.class.js";
import {
  getTarballComposition,
  type TarballComposition
} from "../utils/index.js";

export interface ScannedFilesResult {
  composition: TarballComposition;
  conformance: conformance.SpdxExtractedResult;
  code: SourceCodeReport;
}

export class NpmTarball {
  static JS_EXTENSIONS = new Set([".js", ".mjs", ".cjs"]);

  manifest: LocatedManifestManager;

  constructor(
    mama: ManifestManager
  ) {
    if (!ManifestManager.isLocated(mama)) {
      throw new Error("ManifestManager must have a location");
    }

    this.manifest = mama;
  }

  async scanFiles(): Promise<ScannedFilesResult> {
    const location = this.manifest.location;
    const [
      composition,
      spdx
    ] = await Promise.all([
      getTarballComposition(location),
      conformance.extractLicenses(location)
    ]);

    const code = await new SourceCodeScanner(this.manifest).iterate({
      manifest: [...this.manifest.getEntryFiles()]
        .flatMap(filterJavaScriptFiles()),
      javascript: composition.files
        .flatMap(filterJavaScriptFiles())
    });

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
