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

    const workersAvailable = await this.#checkWorkerSupport();

    // Intelligent Threshold: Use workers only when parallelism benefit > overhead
    // Analysis: Worker overhead ~1.5s, avg file analysis ~10ms
    // Break-even: ~250-280 files (tested: 280 files = +10% gain)
    // Benchmark data: 280 files with 2 workers = +10.1% improvement
    const useWorkers = workersAvailable &&
      process.env.NODE_SECURE_DISABLE_WORKERS !== "true" &&
      sourceFiles.length >= 250;

    if (useWorkers) {
      const { WorkerPool } = await import("./WorkerPool.class.js");
      const pool = WorkerPool.getInstance();

      // Dynamic Load Balancing: Use smaller batches (e.g., 40 files)
      // This allows workers to pull more work as they finish, solving the "straggler" problem
      // where one worker gets stuck with complex files while the other sits idle.
      const BATCH_SIZE = 40;
      const packageGroups: string[][] = [];

      for (let i = 0; i < sourceFiles.length; i += BATCH_SIZE) {
        packageGroups.push(sourceFiles.slice(i, i + BATCH_SIZE));
      }

      await Promise.allSettled(
        packageGroups.map(async(group) => {
          const absoluteFiles = group.map((file) => path.join(location, file));

          try {
            const results = await pool.analyseBatch(absoluteFiles, {
              fileOptions: { packageName }
            });

            for (const result of results) {
              const relativeFile = path.relative(location, result.file);

              if (result.ok && result.result) {
                report.push({ ...result.result, file: relativeFile });
              }
              else {
                // Fallback to synchronous analysis for individual failures
                const fallbackReport = await this.#astAnalyser.analyseFile(
                  result.file,
                  { packageName }
                );
                report.push({ ...fallbackReport, file: relativeFile });
              }
            }
          }
          catch {
            // Fallback for entire group in case of catastrophic WorkerPool failure
            for (const relativeFile of group) {
              const filePath = path.join(location, relativeFile);
              const fileReport = await this.#astAnalyser.analyseFile(
                filePath,
                { packageName }
              );
              report.push({ ...fileReport, file: relativeFile });
            }
          }
        })
      );
    }
    else {
      await Promise.allSettled(
        sourceFiles.map(async(relativeFile) => {
          const filePath = path.join(location, relativeFile);
          const fileReport = await this.#astAnalyser.analyseFile(
            filePath,
            { packageName }
          );

          report.push({ ...fileReport, file: relativeFile });
        })
      );
    }

    return report;
  }

  async #checkWorkerSupport(): Promise<boolean> {
    try {
      const { Worker } = await import("node:worker_threads");

      return typeof Worker === "function";
    }
    catch {
      return false;
    }
  }
}
