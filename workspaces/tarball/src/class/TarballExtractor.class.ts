// Import Node.js Dependencies
import path from "node:path";

// Import Third-party Dependencies
import * as conformance from "@nodesecure/conformance";
import { ManifestManager } from "@nodesecure/mama";
import {
  EntryFilesAnalyser,
  AstAnalyser,
  type Warning,
  type Dependency
} from "@nodesecure/js-x-ray";

// Import Internal Dependencies
import {
  getTarballComposition
} from "../utils/index.js";

export interface NpmTarballExtractOptions {
  registry?: string;
}

export class TarballExtractor {
  static JS_EXTENSIONS = new Set([".js", ".mjs", ".cjs"]);

  public manifest: ManifestManager;
  public archiveLocation: string;

  constructor(
    archiveLocation: string,
    mama: ManifestManager
  ) {
    this.archiveLocation = archiveLocation;
    this.manifest = mama;
  }

  async scan() {
    const [
      composition,
      spdx
    ] = await Promise.all([
      getTarballComposition(this.archiveLocation),
      conformance.extractLicenses(this.archiveLocation)
    ]);

    return {
      spdx,
      composition
    };
  }

  async runJavaScriptSast(
    JSFiles: string[]
  ) {
    const astAnalyzer = new AstAnalyser();

    const dependencies: Record<string, Record<string, Dependency>> = Object.create(null);
    const minified: string[] = [];
    const warnings: Warning[] = [];

    // TODO: make sure all files exist
    const entries = [...this.manifest.getEntryFiles()]
      .filter((entryFile) => TarballExtractor.JS_EXTENSIONS.has(path.extname(entryFile)))
      .map((relPath) => path.join(this.archiveLocation, relPath));

    if (entries.length > 0) {
      const efa = new EntryFilesAnalyser({
        astAnalyzer
      });
      for await (const fileReport of efa.analyse(entries)) {
        warnings.push(
          ...fileReport.warnings.map((warning) => {
            return { ...warning, file: fileReport.file };
          })
        );

        if (fileReport.ok) {
          dependencies[fileReport.file] = Object.fromEntries(
            fileReport.dependencies
          );
          if (fileReport.isMinified) {
            minified.push(fileReport.file);
          }
        }
      }
    }
    else {
      const { name, type = "script" } = this.manifest.document;

      for (const file of JSFiles) {
        const result = await astAnalyzer.analyseFile(
          path.join(this.archiveLocation, file),
          {
            packageName: name,
            module: type === "module"
          }
        );

        warnings.push(
          ...result.warnings.map((curr) => Object.assign({}, curr, { file }))
        );
        if (result.ok) {
          dependencies[file] = Object.fromEntries(result.dependencies);
          if (result.isMinified) {
            minified.push(file);
          }
        }
      }
    }

    return {
      dependencies,
      warnings,
      minified
    };
  }
}
