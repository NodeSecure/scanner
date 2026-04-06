// Import Node.js Dependencies
import path from "node:path";
import { readFileSync } from "node:fs";

// Import Third-party Dependencies
import pacote from "pacote";
import * as npmRegistrySDK from "@nodesecure/npm-registry-sdk";
import {
  type PacoteProvider
} from "@nodesecure/tarball";
import { DefaultCollectableSet } from "@nodesecure/js-x-ray";
import * as Vulnera from "@nodesecure/vulnera";
import { npm } from "@nodesecure/tree-walker";
import {
  ManifestManager,
  parseNpmSpec
} from "@nodesecure/mama";
import { getNpmRegistryURL } from "@nodesecure/npm-registry-sdk";
import type Config from "@npmcli/config";
import semver from "semver";

// Import Internal Dependencies
import {
  getDependenciesWarnings,
  addMissingVersionFlags,
  getUsedDeps,
  getManifestLinks,
  NPM_TOKEN
} from "./utils/index.ts";
import { getRegistryForPackage } from "./utils/npmrc.ts";
import {
  NpmRegistryProvider,
  type NpmApiClient
} from "./registry/NpmRegistryProvider.ts";
import { StatsCollector } from "./class/StatsCollector.class.ts";
import { RegistryTokenStore } from "./registry/RegistryTokenStore.ts";
import { TempDirectory } from "./class/TempDirectory.class.ts";
import {
  Logger,
  ScannerLoggerEvents
} from "./class/logger.class.ts";
import { TarballScanner } from "./class/TarballScanner.class.ts";
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

const kCollectableTypes = ["url", "hostname", "ip", "email"];

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
  npmRcEntries?: Record<string, string>;
  integrity?: string | null;
};

type InitialPayload =
  Partial<Payload> &
  {
    rootDependency: Payload["rootDependency"];
  };

type Metadata = {
  spec?: string;
};

export async function depWalker(
  mama: ManifestManager,
  options: WalkerOptions,
  logger = new Logger()
): Promise<Payload> {
  const {
    scanRootNode = false,
    includeDevDeps = false,
    isVerbose = false,
    packageLock,
    maxDepth,
    location,
    vulnerabilityStrategy = Vulnera.strategies.NONE,
    registry,
    npmRcConfig,
    npmRcEntries = {},
    maxConcurrency = 8,
    workers,
    integrity: manifestIntegrity = null
  } = options;

  const statsCollector = new StatsCollector({ logger }, { isVerbose });
  const collectables = kCollectableTypes.map(
    (type) => new DefaultCollectableSet<Metadata>(type)
  );

  const tokenStore = new RegistryTokenStore(
    npmRcConfig,
    NPM_TOKEN.token,
    npmRcEntries
  );

  const npmProjectConfig = tokenStore.getConfig(registry);
  const pacoteScopedConfig = {
    ...npmProjectConfig,
    ...npmRcEntries,
    userAgent: `@nodesecure/scanner node/${process.version}`
  };

  const pacoteProvider: PacoteProvider = {
    async extract(spec, dest, opts): Promise<void> {
      await statsCollector.track({
        name: `pacote.extract ${spec}`,
        phase: "tarball-scan",
        fn: () => pacote.extract(spec, dest, {
          ...opts,
          ...pacoteScopedConfig
        })
      });
    }
  };

  const isRemoteScanning = typeof location === "undefined";

  await using tempDir = await TempDirectory.create();

  const dependencyConfusionWarnings: DependencyConfusionWarning[] = [];

  const payload: InitialPayload = {
    id: tempDir.id,
    rootDependency: {
      name: mama.name,
      version: mama.version,
      integrity: null
    },
    scannerVersion: packageVersion,
    vulnerabilityStrategy,
    warnings: []
  };

  const dependencies: Map<string, Dependency> = new Map();
  const highlightedPackages: Set<string> = new Set();
  const identifiersToHighlight = new Set<string>(options.highlight?.identifiers ?? []);
  const npmTreeWalker = new npm.TreeWalker({
    registry,
    providers: {
      pacote: {
        manifest: (spec, opts) => statsCollector.track({
          name: `pacote.manifest ${spec}`,
          phase: "tree-walk", fn: () => pacote.manifest(spec,
            { ...opts, ...pacoteScopedConfig })
        }),
        packument: (spec, opts) => statsCollector.track({
          name: `pacote.packument ${spec}`,
          phase: "tree-walk",
          fn: () => pacote.packument(spec, { ...opts, ...pacoteScopedConfig })
        })
      }
    }
  });
  const npmApiClient: NpmApiClient = {
    packument: (name, opts) => statsCollector.track({
      name: `npmRegistrySDK.packument ${name}`,
      phase: "metadata-fetch",
      fn: () => npmRegistrySDK.packument(name, opts)
    }),

    packumentVersion: (name, version, opts) => statsCollector.track({
      name: `npmRegistrySDK.packumentVersion ${name}@${version}`,
      phase: "metadata-fetch",
      fn: () => npmRegistrySDK.packumentVersion(name, version, opts)
    }),

    org: (namespace) => statsCollector.track({
      name: `npmRegistrySDK.org ${namespace}`,
      phase: "metadata-fetch",
      fn: () => npmRegistrySDK.org(namespace)
    })
  };

  logger
    .start(ScannerLoggerEvents.analysis.tree)
    .start(ScannerLoggerEvents.analysis.tarball)
    .start(ScannerLoggerEvents.analysis.registry);
  const fetchedMetadataPackages = new Set<string>();
  const operationsQueue: Promise<void>[] = [];

  await using tarballScanner = new TarballScanner({
    tempDir,
    statsCollector,
    pacoteProvider,
    collectables,
    maxConcurrency,
    logger,
    workers
  });

  const rootDepsOptions: npm.WalkOptions = {
    maxDepth,
    includeDevDeps,
    packageLock
  };
  try {
    for await (const current of npmTreeWalker.walk(mama, rootDepsOptions)) {
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
        const packageRegistry = getRegistryForPackage(name, npmRcEntries, registry);
        operationsQueue.push(
          new NpmRegistryProvider(name, version, {
            registry: packageRegistry,
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
        payload.rootDependency.integrity = manifestIntegrity ?? mama.documentDigest;
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
        const packageRegistry = getRegistryForPackage(name, npmRcEntries, registry);
        const provider = new NpmRegistryProvider(name, version, {
          registry: packageRegistry,
          tokenStore
        });

        operationsQueue.push(provider.enrichDependency(logger, dependency));
        if (packageRegistry !== getNpmRegistryURL() && org) {
          operationsQueue.push(
            new NpmRegistryProvider(name, version, {
              registry: packageRegistry,
              tokenStore
            }).enrichScopedDependencyConfusionWarnings(dependencyConfusionWarnings, org)
          );
        }
      }

      operationsQueue.push(
        tarballScanner.scan({
          name,
          version,
          ref: dependency.versions[version] as any,
          location,
          isRootNode: scanRootNode && name === mama.name,
          registry
        })
      );
    }
  }
  finally {
    logger.end(ScannerLoggerEvents.analysis.tree);
    await Promise.allSettled(operationsQueue);

    logger
      .end(ScannerLoggerEvents.analysis.tarball)
      .end(ScannerLoggerEvents.analysis.registry);
  }

  const { hydratePayloadDependencies, strategy } = Vulnera.setStrategy(
    vulnerabilityStrategy
  );

  const isVulnHydratable = strategy === "github-advisory" && isRemoteScanning;
  if (!isVulnHydratable) {
    await hydratePayloadDependencies(dependencies, {
      useFormat: "Standard",
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
      const packageRange = semverRanges?.[packageName];
      const org = parseNpmSpec(packageName)?.org;
      const isScopeHighlighted = org !== null && `@${org}` in semverRanges;

      if (
        (packageRange && semver.satisfies(verStr, packageRange)) ||
        isScopeHighlighted
      ) {
        highlightedPackages.add(`${packageName}@${verStr}`);
      }
      verDescriptor.flags.push(
        ...addMissingVersionFlags(new Set(verDescriptor.flags), dependency)
      );

      if (isLocalManifest(verDescriptor, mama, packageName)) {
        const author = mama.author;
        Object.assign(dependency.metadata, {
          author,
          homepage: mama.document.homepage
        });

        Object.assign(verDescriptor, {
          author,
          links: getManifestLinks(mama.document),
          repository: mama.document.repository
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
      packages: [...highlightedPackages],
      identifiers: extractHighlightedIdentifiers(collectables, identifiersToHighlight)
    };
    payload.dependencies = Object.fromEntries(dependencies);
    payload.metadata = statsCollector.getStats();

    return payload as Payload;
  }
  finally {
    logger.emit(ScannerLoggerEvents.done);
  }
}

function extractHighlightedIdentifiers(
  collectables: DefaultCollectableSet<Metadata>[],
  identifiersToHighlight: Set<string>
) {
  if (identifiersToHighlight.size === 0) {
    return [];
  }

  return collectables.flatMap((collectableSet) => Array.from(collectableSet)
    .flatMap(({ value, locations }) => (identifiersToHighlight.has(value) ?
      locations.map(({ file, metadata, location }) => {
        return {
          value,
          spec: metadata?.spec,
          location: {
            file,
            lines: location
          }
        };
      }) : [])));
}

function isLocalManifest(
  verDescriptor: DependencyVersion,
  mama: ManifestManager,
  packageName: string
): boolean {
  return verDescriptor.existOnRemoteRegistry === false && (
    packageName === mama.document.name || mama.document.name === undefined
  );
}
