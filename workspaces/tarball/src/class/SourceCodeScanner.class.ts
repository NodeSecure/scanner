// Import Node.js Dependencies
import path from "node:path";

// Import Third-party Dependencies
import {
  EntryFilesAnalyser,
  AstAnalyser,
  type Warning,
  type Dependency,
  type ReportOnFile
} from "@nodesecure/js-x-ray";
import { ManifestManager } from "@nodesecure/mama";

// Import Internal Dependencies
import {
  filterDependencyKind,
  analyzeDependencies
} from "../utils/index.js";

export class SourceCodeReport {
  #isConsumed = false;

  warnings: Warning[] = [];
  dependencies: Record<
    string,
    Record<string, Dependency>
  > = Object.create(null);
  minified: string[] = [];
  flags = {
    hasExternalCapacity: false
  };

  get consumed() {
    return this.#isConsumed;
  }

  push(
    report: ReportOnFile & { file: string; }
  ): this {
    this.#isConsumed = true;
    this.warnings.push(
      ...report.warnings.map((warning) => {
        return { ...warning, file: report.file };
      })
    );

    if (report.ok) {
      if (report.flags.has("fetch")) {
        this.flags.hasExternalCapacity = true;
      }
      this.dependencies[report.file] = Object.fromEntries(
        report.dependencies
      );
      report.flags.has("is-minified") && this.minified.push(report.file);
    }

    return this;
  }

  groupAndAnalyseDependencies(
    mama: ManifestManager
  ) {
    const files = new Set<string>();
    const dependencies = new Set<string>();
    const dependenciesInTryBlock = new Set<string>();

    for (const [file, fileDeps] of Object.entries(this.dependencies)) {
      const filtered = filterDependencyKind(
        [...Object.keys(fileDeps)],
        path.dirname(file)
      );

      [...Object.entries(fileDeps)]
        .flatMap(([name, dependency]) => (dependency.inTry ? [name] : []))
        .forEach((name) => dependenciesInTryBlock.add(name));

      filtered.packages.forEach((name) => dependencies.add(name));
      filtered.files.forEach((file) => files.add(file));
    }

    const {
      nodeDependencies,
      thirdPartyDependencies,
      subpathImportsDependencies,
      missingDependencies,
      unusedDependencies,
      flags
    } = analyzeDependencies(
      [...dependencies],
      { mama, tryDependencies: dependenciesInTryBlock }
    );

    return {
      files,
      dependencies: {
        nodejs: nodeDependencies,
        subpathImports: subpathImportsDependencies,
        thirdparty: thirdPartyDependencies,
        missing: missingDependencies,
        unused: unusedDependencies
      },
      flags
    };
  }
}

export interface SourceCodeEntries {
  /**
   * Source files from package.json
   */
  manifest: string[];
  /**
   * All JavaScript source files from tarball
   */
  javascript: string[];
}

export class SourceCodeScanner {
  #astAnalyser = new AstAnalyser();

  manifest: ManifestManager;

  constructor(
    manifest: ManifestManager
  ) {
    this.manifest = manifest;
  }

  async iterate(
    entries: SourceCodeEntries
  ): Promise<SourceCodeReport> {
    return entries.manifest.length > 0 ?
      this.iterateWithEntries(entries) :
      this.iterateAll(entries.javascript);
  }

  async iterateWithEntries(
    entries: SourceCodeEntries
  ): Promise<SourceCodeReport> {
    const report = new SourceCodeReport();

    const efa = new EntryFilesAnalyser({
      astAnalyzer: this.#astAnalyser,
      ignoreENOENT: true
    });
    for await (const fileReport of efa.analyse(entries.manifest)) {
      report.push(fileReport);
    }
    if (!report.consumed) {
      return this.iterateAll(entries.javascript);
    }

    return report;
  }

  async iterateAll(
    sourceFiles: string[]
  ): Promise<SourceCodeReport> {
    const { name, type = "script" } = this.manifest.document;
    const report = new SourceCodeReport();

    await Promise.allSettled(
      sourceFiles.map(async(relativeFile) => {
        const filePath = path.join(this.manifest.location!, relativeFile);
        const fileReport = await this.#astAnalyser.analyseFile(
          filePath,
          {
            packageName: name,
            module: type === "module"
          }
        );

        report.push({ ...fileReport, file: relativeFile });
      })
    );

    return report;
  }
}
