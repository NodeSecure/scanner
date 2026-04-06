// Import Third-party Dependencies
import { Mutex } from "@openally/mutex";
import {
  extractAndResolve,
  scanDirOrArchive,
  NpmTarballWorkerPool,
  type PacoteProvider,
  type ScanResultPayload
} from "@nodesecure/tarball";
import {
  DefaultCollectableSet,
  type CollectableSetData
} from "@nodesecure/js-x-ray";
import { ManifestManager } from "@nodesecure/mama";

// Import Internal Dependencies
import { StatsCollector } from "./StatsCollector.class.ts";
import { TempDirectory } from "./TempDirectory.class.ts";
import { Logger, ScannerLoggerEvents } from "./logger.class.ts";

type CollectableMetadata = { spec?: string; };

export interface ScanContext {
  name: string;
  version: string;
  ref: any;
  registry?: string;
  location?: string;
  isRootNode: boolean;
}

export interface TarballScannerOptions {
  tempDir: TempDirectory;
  statsCollector: StatsCollector;
  pacoteProvider?: PacoteProvider;
  collectables: DefaultCollectableSet<CollectableMetadata>[];
  maxConcurrency: number;
  logger: Logger;
  workers?: boolean | number;
}

export class TarballScanner {
  #locker: Mutex;
  #tempDir: TempDirectory;
  #statsCollector: StatsCollector;
  #pacoteProvider: PacoteProvider | undefined;
  #collectables: DefaultCollectableSet<CollectableMetadata>[];
  #collectableTypes: string[];
  #workerPool: NpmTarballWorkerPool | null;
  #logger: Logger;

  constructor(
    options: TarballScannerOptions
  ) {
    const {
      tempDir,
      statsCollector,
      pacoteProvider,
      collectables,
      maxConcurrency,
      logger,
      workers
    } = options;

    this.#tempDir = tempDir;
    this.#statsCollector = statsCollector;
    this.#pacoteProvider = pacoteProvider;
    this.#collectables = collectables;
    this.#collectableTypes = collectables.map((collectable) => collectable.type);
    this.#logger = logger;

    this.#locker = new Mutex({ concurrency: maxConcurrency });

    this.#workerPool = workers
      ? new NpmTarballWorkerPool({
        workerCount: typeof workers === "number" ? workers : undefined
      })
      : null;
  }

  async scan(
    context: ScanContext
  ): Promise<void> {
    if (this.#workerPool && !context.isRootNode) {
      await this.#scanWithWorkers(context);
    }
    else {
      await this.#scanDirect(context);
    }

    this.#logger.tick(ScannerLoggerEvents.analysis.tarball);
  }

  async #scanWithWorkers(
    context: ScanContext
  ): Promise<void> {
    const {
      name,
      version,
      ref,
      registry,
      location
    } = context;

    const spec = `${name}@${version}`;
    const hasLocation = typeof location !== "undefined";

    const mama = await this.#extract(spec, registry);

    const result = await this.#statsCollector.track({
      name: `tarball.scanDirOrArchive ${spec}`,
      phase: "tarball-scan",
      fn: () => this.#workerPool!.scan({
        location: mama.location!,
        astAnalyserOptions: {
          optionalWarnings: hasLocation
        },
        collectableTypes: this.#collectableTypes
      }),
      onSuccess: (result, stat) => {
        stat.tarball = {
          path: result.path,
          filesCount: result.composition.files.length
        };
      }
    });

    this.#applyResult(ref, result);
    this.#mergeCollectables(result.collectables);
  }

  async #scanDirect(
    context: ScanContext
  ): Promise<void> {
    const {
      name,
      version,
      ref,
      registry,
      location = process.cwd(),
      isRootNode
    } = context;

    const spec = `${name}@${version}`;
    const hasLocation = typeof context.location !== "undefined";

    using _ = await this.#locker.acquire();

    const mama = await (isRootNode ?
      ManifestManager.fromPackageJSON(location) :
      extractAndResolve(this.#tempDir.location, {
        spec,
        registry,
        pacoteProvider: this.#pacoteProvider
      })
    );

    await this.#statsCollector.track({
      name: `tarball.scanDirOrArchive ${spec}`,
      phase: "tarball-scan",
      fn: () => scanDirOrArchive(mama, ref, {
        astAnalyserOptions: {
          optionalWarnings: hasLocation,
          collectables: this.#collectables
        }
      }),
      onSuccess: (_, stat) => {
        stat.tarball = {
          path: ref.path,
          filesCount: ref.composition.files.length
        };
        delete ref.path;
      }
    });
  }

  async #extract(
    spec: string,
    registry?: string
  ): Promise<ManifestManager> {
    using _ = await this.#locker.acquire();

    return extractAndResolve(this.#tempDir.location, {
      spec,
      registry,
      pacoteProvider: this.#pacoteProvider
    });
  }

  #applyResult(
    ref: any,
    result: ScanResultPayload
  ): void {
    const { description, engines, repository, scripts, author, integrity } = result;
    Object.assign(ref, { description, engines, repository, scripts, author, integrity });

    ref.warnings.push(...result.warnings);
    ref.licenses = result.licenses;
    ref.uniqueLicenseIds = result.uniqueLicenseIds;
    ref.type = result.type;
    ref.size = result.size;
    ref.composition.extensions.push(...result.composition.extensions);
    ref.composition.files.push(...result.composition.files);
    ref.composition.minified = result.composition.minified;
    ref.composition.unused.push(...result.composition.unused);
    ref.composition.missing.push(...result.composition.missing);
    ref.composition.required_files = result.composition.required_files;
    ref.composition.required_nodejs = result.composition.required_nodejs;
    ref.composition.required_thirdparty = result.composition.required_thirdparty;
    ref.composition.required_subpath = result.composition.required_subpath;

    const flags = result.flags.filter(
      (flag) => flag !== "hasWarnings" || !ref.flags.includes("hasWarnings")
    );
    ref.flags.push(...flags);
  }

  #mergeCollectables(
    serialized: CollectableSetData[] = []
  ): void {
    for (const data of serialized) {
      const sharedSet = this.#collectables.find(
        (collectable) => collectable.type === data.type
      );
      sharedSet && DefaultCollectableSet.mergeData(sharedSet, data);
    }
  }

  async [Symbol.asyncDispose](): Promise<void> {
    await this.#workerPool?.terminate();
  }
}
