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
import {
  ManifestManager,
  type LocatedManifestManager
} from "@nodesecure/mama";

// Import Internal Dependencies
import {
  filterDependencyKind,
  analyzeDependencies
} from "../utils/index.ts";

export interface SourceCodeAggregator {
  readonly consumed: boolean;

  push(report: ReportOnFile & { file: string; }): void;
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

export class SourceCodeReport implements SourceCodeAggregator {
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
  ) {
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
      dependenciesInTryBlock: [...dependenciesInTryBlock],
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

export interface SourceCodeScannerOptions<T> {
  reportInitiator?: () => T;
  astAnalyser?: AstAnalyser;
}

export class SourceCodeScanner<
  T extends SourceCodeAggregator = SourceCodeReport
> {
  #astAnalyser: AstAnalyser;
  #initNewReport: () => T;

  manifest: LocatedManifestManager;

  constructor(
    manifest: LocatedManifestManager,
    options: SourceCodeScannerOptions<T> = {}
  ) {
    const {
      reportInitiator = () => new SourceCodeReport(),
      astAnalyser = new AstAnalyser()
    } = options;

    this.manifest = manifest;
    this.#astAnalyser = astAnalyser;
    this.#initNewReport = reportInitiator as () => T;
  }

  async iterate(
    entries: SourceCodeEntries
  ): Promise<T> {
    const report = this.#initNewReport();
    if (
      entries.manifest.length === 0 &&
      entries.javascript.length === 0
    ) {
      return report;
    }

    return entries.manifest.length > 0 ?
      this.#iterateWithEntries(report, entries) :
      this.#iterateAll(report, entries.javascript);
  }

  async #iterateWithEntries(
    report: T,
    entries: SourceCodeEntries
  ): Promise<T> {
    const { location } = this.manifest;

    const efa = new EntryFilesAnalyser({
      astAnalyzer: this.#astAnalyser,
      rootPath: location,
      ignoreENOENT: true
    });

    const absoluteEntryFiles = entries.manifest.map(
      (filePath) => path.join(location, filePath)
    );

    for await (const fileReport of efa.analyse(absoluteEntryFiles)) {
      report.push(fileReport);
    }

    return report.consumed ?
      report :
      this.#iterateAll(report, entries.javascript);
  }

  async #iterateAll(
    report: T,
    sourceFiles: string[]
  ): Promise<T> {
    if (sourceFiles.length === 0) {
      return report;
    }

    const {
      location,
      document: { name: packageName }
    } = this.manifest;

    await Promise.allSettled(
      sourceFiles.map(async(relativeFile) => {
        const filePath = path.join(location, relativeFile);
        const fileReport = await this.#astAnalyser.analyseFile(
          filePath,
          {
            packageName
          }
        );

        report.push({ ...fileReport, file: relativeFile });
      })
    );

    return report;
  }
}
