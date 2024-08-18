// Import Node.js Dependencies
import os from "node:os";
import path from "node:path";

// Import Third-party Dependencies
import pacote from "pacote";
import * as conformance from "@nodesecure/conformance";
import { ManifestManager } from "@nodesecure/mama";
import {
  EntryFilesAnalyser,
  type Warning,
  type Dependency
} from "@nodesecure/js-x-ray";

// Import Internal Dependencies
import {
  getTarballComposition
} from "../utils/index.js";

// CONSTANTS
const NPM_TOKEN = typeof process.env.NODE_SECURE_TOKEN === "string" ?
  { token: process.env.NODE_SECURE_TOKEN } :
  {};
const kJsExtname = new Set([".js", ".mjs", ".cjs"]);

export interface NpmTarballExtractOptions {
  registry?: string;
}

export class TarballExtractor {
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

  async runJavaScriptSast() {
    const dependencies: Record<string, Record<string, Dependency>> = Object.create(null);
    const minified: string[] = [];
    const warnings: Warning[] = [];

    const efa = new EntryFilesAnalyser();
    const entries = [...this.manifest.getEntryFiles()]
      .filter((entryFile) => kJsExtname.has(path.extname(entryFile)));

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
        fileReport.isMinified && minified.push(fileReport.file);
      }
    }

    return {
      dependencies,
      warnings,
      minified
    };
  }

  static async fromNpm(
    location: string,
    spec: string,
    options: NpmTarballExtractOptions = {}
  ) {
    const { registry } = options;

    await pacote.extract(spec, location, {
      ...NPM_TOKEN,
      registry,
      cache: `${os.homedir()}/.npm`
    });

    return this.fromFileSystem(location);
  }

  static async fromFileSystem(
    location: string
  ): Promise<TarballExtractor> {
    const mama = await ManifestManager.fromPackageJSON(location);

    return new TarballExtractor(location, mama);
  }
}

