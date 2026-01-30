// Import Node.js Dependencies
import path from "node:path";
import { readFileSync } from "node:fs";

// Import Third-party Dependencies
import pacote from "pacote";
import * as npmRegistrySDK from "@nodesecure/npm-registry-sdk";
import { Mutex, MutexRelease } from "@openally/mutex";
import {
  extractAndResolve,
  scanDirOrArchive,
  type PacoteProvider
} from "@nodesecure/tarball";
import * as Vulnera from "@nodesecure/vulnera";
import { npm } from "@nodesecure/tree-walker";
import { parseAuthor } from "@nodesecure/utils";
import { ManifestManager, parseNpmSpec } from "@nodesecure/mama";
import type { ManifestVersion, PackageJSON, WorkspacesPackageJSON } from "@nodesecure/npm-types";
import { getNpmRegistryURL } from "@nodesecure/npm-registry-sdk";
import type Config from "@npmcli/config";
import { fromData } from "ssri";
import semver from "semver";

// Import Internal Dependencies
import {
  getDependenciesWarnings,
  addMissingVersionFlags,
  getUsedDeps,
  getManifestLinks,
  NPM_TOKEN
} from "./utils/index.ts";
import { NpmRegistryProvider, type NpmApiClient } from "./registry/NpmRegistryProvider.ts";
import { StatsCollector } from "./class/StatsCollector.class.ts";
import { RegistryTokenStore } from "./registry/RegistryTokenStore.ts";
import { TempDirectory } from "./class/TempDirectory.class.ts";
import { Logger, ScannerLoggerEvents } from "./class/logger.class.ts";
import type {
  Dependency,
  DependencyVersion,
  GlobalWarning,
  DependencyConfusionWarning,
  Options,
  Payload
} from "./types.ts";
import { parseSemverRange } from "./utils/parseSemverRange.ts";

// CONSTANTS
const kDefaultDependencyVersionFields = {
  description: "",
  size: 0,
  author: null,
  engines: {},
  scripts: {},
  licenses: [],
  uniqueLicenseIds: [],
  composition: {
    extensions: [],
    files: [],
    minified: [],
    unused: [],
    missing: [],
    required_files: [],
    required_nodejs: [],
    required_thirdparty: [],
    required_subpath: []
  }
};
const kDefaultDependencyMetadata: Dependency["metadata"] = {
  publishedCount: 0,
  lastUpdateAt: new Date(),
  lastVersion: "N/A",
  hasChangedAuthor: false,
  hasManyPublishers: false,
  hasReceivedUpdateInOneYear: true,
  homepage: null,
  author: null,
  publishers: [],
  maintainers: [],
  integrity: {}
};

const kRootDependencyId = 0;

const { version: packageVersion } = JSON.parse(
  readFileSync(
    new URL(path.join("..", "package.json"), import.meta.url),
    "utf-8"
  )
);

type WalkerOptions = Omit<Options, "registry"> & {
  registry: string;
  location?: string;
  npmRcConfig?: Config;
};

type InitialPayload =
  Partial<Payload> &
  {
    rootDependency: Payload["rootDependency"];
  };

export async function depWalker(
  manifest: PackageJSON | WorkspacesPackageJSON | ManifestVersion,
  options: WalkerOptions,
  logger = new Logger()
): Promise<Payload> {
  const {
    scanRootNode = false,
    includeDevDeps = false,
    packageLock,
    maxDepth,
    location,
    vulnerabilityStrategy = Vulnera.strategies.NONE,
    registry,
    npmRcConfig
  } = options;

  const statsCollector = new StatsCollector();

  const pacoteProvider: PacoteProvider = {
    extract: async(spec, dest, opts) => {
      await statsCollector.track(
        `pacote.extract ${spec}`,
        () => pacote.extract(spec, dest, opts)
      );
    }
  };

  const isRemoteScanning = typeof location === "undefined";
  const tokenStore = new RegistryTokenStore(npmRcConfig, NPM_TOKEN.token);

  await using tempDir = await TempDirectory.create();

  const dependencyConfusionWarnings: DependencyConfusionWarning[] = [];

  const payload: InitialPayload = {
    id: tempDir.id,
    rootDependency: {
      name: manifest.name ?? "workspace",
      version: manifest.version ?? "0.0.0",
      integrity: null
    },
    scannerVersion: packageVersion,
    vulnerabilityStrategy,
    warnings: []
  };

  const dependencies: Map<string, Dependency> = new Map();
  const highlightedPackages: Set<string> = new Set();
  const npmTreeWalker = new npm.TreeWalker({
    registry,
    providers: {
      pacote: {
        manifest: (spec, opts) => statsCollector.track(`pacote.manifest ${spec}`, () => pacote.manifest(spec, opts)),
        packument: (spec, opts) => statsCollector.track(`pacote.packument ${spec}`, () => pacote.packument(spec, opts))
      }
    }
  });
  const npmApiClient: NpmApiClient = {
    packument: (name, opts) => statsCollector.track(
      `npmRegistrySDK.packument ${name}`,
      () => npmRegistrySDK.packument(name, opts)
    ),

    packumentVersion: (name, version, opts) => statsCollector.track(
      `npmRegistrySDK.packumentVersion ${name}@${version}`,
      () => npmRegistrySDK.packumentVersion(name, version, opts)
    ),

    org: (namespace) => statsCollector.track(
      `npmRegistrySDK.org ${namespace}`,
      () => npmRegistrySDK.org(namespace)
    )
  };
  {
    logger
      .start(ScannerLoggerEvents.analysis.tree)
      .start(ScannerLoggerEvents.analysis.tarball)
      .start(ScannerLoggerEvents.analysis.registry);
    const fetchedMetadataPackages = new Set<string>();
    const operationsQueue: Promise<void>[] = [];

    const locker = new Mutex({ concurrency: 5 });
    locker.on(
      MutexRelease,
      () => logger.tick(ScannerLoggerEvents.analysis.tarball)
    );

    const rootDepsOptions: npm.WalkOptions = {
      maxDepth,
      includeDevDeps,
      packageLock
    };
    for await (const current of npmTreeWalker.walk(manifest, rootDepsOptions)) {
      const { name, version, integrity, ...currentVersion } = current;
      const dependency: Dependency = {
        versions: {
          [version]: {
            ...currentVersion,
            ...structuredClone(kDefaultDependencyVersionFields)
          }
        },
        vulnerabilities: [],
        metadata: structuredClone(kDefaultDependencyMetadata)
      };

      let proceedDependencyScan = true;
      const org = parseNpmSpec(name)?.org;
      if (dependencies.has(name)) {
        const dep = dependencies.get(name)!;
        operationsQueue.push(
          new NpmRegistryProvider(name, version, {
            registry,
            tokenStore,
            npmApiClient
          }).enrichDependencyVersion(dep, dependencyConfusionWarnings, org)
        );

        if (version in dep.versions) {
          // The dependency has already entered the analysis
          // This happens if the package is used by multiple packages in the tree
          proceedDependencyScan = false;
        }
        else {
          dep.versions[version] = dependency.versions[version];
        }
      }
      else {
        dependencies.set(name, dependency);
      }

      const isRoot = current.id === kRootDependencyId;

      if (isRoot && payload.rootDependency.integrity) {
        payload.rootDependency.integrity = integrity;
      }
      else if (isRoot) {
        const isWorkspace = options.location && "workspaces" in manifest;
        payload.rootDependency.integrity = isWorkspace ?
          null :
          fromData(JSON.stringify(manifest), { algorithms: ["sha512"] }).toString();
      }

      // If the dependency is a DevDependencies we ignore it.
      if (current.isDevDependency || !proceedDependencyScan) {
        continue;
      }

      logger.tick(ScannerLoggerEvents.analysis.tree);

      // There is no need to fetch 'N' times the npm metadata for the same package.
      if (fetchedMetadataPackages.has(name) || !current.existOnRemoteRegistry) {
        logger.tick(ScannerLoggerEvents.analysis.registry);
      }
      else {
        fetchedMetadataPackages.add(name);
        const provider = new NpmRegistryProvider(name, version, {
          registry,
          tokenStore
        });

        operationsQueue.push(provider.enrichDependency(logger, dependency));
        if (registry !== getNpmRegistryURL() && org) {
          operationsQueue.push(
            new NpmRegistryProvider(name, version, {
              registry,
              tokenStore
            }).enrichScopedDependencyConfusionWarnings(dependencyConfusionWarnings, org)
          );
        }
      }

      const scanDirOptions = {
        ref: dependency.versions[version] as any,
        location,
        isRootNode: scanRootNode && name === manifest.name,
        registry,
        statsCollector,
        pacoteProvider
      };
      operationsQueue.push(
        scanDirOrArchiveEx(name, version, locker, tempDir, logger, scanDirOptions)
      );
    }

    logger.end(ScannerLoggerEvents.analysis.tree);
    await Promise.allSettled(operationsQueue);

    logger
      .end(ScannerLoggerEvents.analysis.tarball)
      .end(ScannerLoggerEvents.analysis.registry);
  }

  const { hydratePayloadDependencies, strategy } = Vulnera.setStrategy(
    vulnerabilityStrategy
  );

  const isVulnHydratable = (strategy === "github-advisory" || strategy === "snyk")
    && isRemoteScanning;
  if (!isVulnHydratable) {
    await hydratePayloadDependencies(dependencies as any, {
      useStandardFormat: true,
      path: location
    });
  }

  payload.vulnerabilityStrategy = strategy;

  // We do this because it "seem" impossible to link all dependencies in the first walk.
  // Because we are dealing with package only one time it may happen sometimes.
  const globalWarnings: GlobalWarning[] = [];
  for (const [packageName, dependency] of dependencies) {
    const metadataIntegrities = dependency.metadata?.integrity ?? {};

    for (const [version, integrity] of Object.entries(metadataIntegrities)) {
      const dependencyVer = dependency.versions[version] as DependencyVersion;

      const isEmptyPackage = dependencyVer.warnings.some((warning) => warning.kind === "empty-package");
      if (isEmptyPackage) {
        globalWarnings.push({
          type: "empty-package",
          message: `${packageName}@${version} only contain a package.json file!`
        });
      }

      if (!("integrity" in dependencyVer) || dependencyVer.flags.includes("isGit")) {
        continue;
      }

      if (dependencyVer.integrity !== integrity) {
        globalWarnings.push({
          type: "integrity-mismatch",
          message: `${packageName}@${version} manifest & tarball integrity doesn't match!`
        });
      }
    }
    const semverRanges = parseSemverRange(options.highlight?.packages ?? {});
    for (const version of Object.entries(dependency.versions)) {
      const [verStr, verDescriptor] = version as [string, DependencyVersion];
      const range = semverRanges?.[packageName];
      if (range && semver.satisfies(verStr, range)) {
        highlightedPackages.add(`${packageName}@${verStr}`);
      }
      verDescriptor.flags.push(
        ...addMissingVersionFlags(new Set(verDescriptor.flags), dependency)
      );

      if (isLocalManifest(verDescriptor, manifest, packageName)) {
        Object.assign(dependency.metadata, {
          author: parseAuthor(manifest.author),
          homepage: manifest.homepage
        });

        Object.assign(verDescriptor, {
          author: parseAuthor(manifest.author),
          links: getManifestLinks(manifest),
          repository: manifest.repository
        });
      }

      const usedDeps = npmTreeWalker.relationsMap.get(`${packageName}@${verStr}`) || new Set();
      if (usedDeps.size === 0) {
        continue;
      }

      const usedBy: Record<string, string> = Object.create(null);
      for (const [name, version] of getUsedDeps(usedDeps)) {
        usedBy[name] = version;
      }
      Object.assign(verDescriptor.usedBy, usedBy);
    }
  }

  try {
    const { warnings, illuminated } = await getDependenciesWarnings(
      dependencies,
      options.highlight?.contacts,
      isRemoteScanning
    );
    payload.warnings = globalWarnings.concat(dependencyConfusionWarnings as GlobalWarning[]).concat(warnings);
    payload.highlighted = {
      contacts: illuminated,
      packages: [...highlightedPackages]
    };
    payload.dependencies = Object.fromEntries(dependencies);
    payload.metadata = statsCollector.getStats();

    return payload as Payload;
  }
  finally {
    logger.emit(ScannerLoggerEvents.done);
  }
}

// eslint-disable-next-line max-params
async function scanDirOrArchiveEx(
  name: string,
  version: string,
  locker: Mutex,
  tempDir: TempDirectory,
  logger: Logger,
  options: {
    registry?: string;
    isRootNode: boolean;
    location: string | undefined;
    ref: any;
    statsCollector: StatsCollector;
    pacoteProvider?: PacoteProvider;
  }
) {
  using _ = await locker.acquire();

  const spec = `${name}@${version}`;

  try {
    const {
      registry,
      location = process.cwd(),
      isRootNode,
      ref,
      statsCollector,
      pacoteProvider
    } = options;

    const mama = await (isRootNode ?
      ManifestManager.fromPackageJSON(location) :
      extractAndResolve(tempDir.location, {
        spec,
        registry,
        pacoteProvider
      })
    );

    await statsCollector.track(`tarball.scanDirOrArchive ${spec}`, () => scanDirOrArchive(mama, ref, {
      astAnalyserOptions: {
        optionalWarnings: typeof location !== "undefined"
      }
    }));
  }
  catch (error: any) {
    logger.emit(ScannerLoggerEvents.error, error, "tarball-scan");
  }
}

function isLocalManifest(
  verDescriptor: DependencyVersion,
  manifest: PackageJSON | WorkspacesPackageJSON | ManifestVersion,
  packageName: string
): manifest is PackageJSON | WorkspacesPackageJSON {
  return verDescriptor.existOnRemoteRegistry === false && (
    packageName === manifest.name || manifest.name === undefined
  );
}
