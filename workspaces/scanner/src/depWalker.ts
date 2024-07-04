// Import Node.js Dependencies
import path from "node:path";
import { readFileSync, promises as fs } from "node:fs";
import timers from "node:timers/promises";
import os from "node:os";

// Import Third-party Dependencies
import { Mutex, MutexRelease } from "@openally/mutex";
import { scanDirOrArchive, type scanDirOrArchiveOptions } from "@nodesecure/tarball";
import * as vuln from "@nodesecure/vuln";
import * as treeWalker from "@nodesecure/tree-walker";
import type { ManifestVersion, PackageJSON } from "@nodesecure/npm-types";

// Import Internal Dependencies
import {
  getDependenciesWarnings, addMissingVersionFlags
} from "./utils/index.js";
import { packageMetadata, manifestMetadata } from "./npmRegistry.js";
import { Logger, ScannerLoggerEvents } from "./class/logger.class.js";
import type {
  Dependency,
  DependencyVersion,
  Options,
  Payload
} from "./types.js";

// CONSTANTS
const kDefaultDependencyVersionFields = {
  description: "",
  size: 0,
  author: null,
  engines: {},
  scripts: {},
  license: [],
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

const { version: packageVersion } = JSON.parse(
  readFileSync(
    new URL(path.join("..", "package.json"), import.meta.url),
    "utf-8"
  )
);

type WalkerOptions = Omit<Options, "registry"> & {
  registry: string;
  location?: string;
}

export async function depWalker(
  manifest: PackageJSON | ManifestVersion,
  options: WalkerOptions,
  logger = new Logger()
): Promise<Payload> {
  const {
    scanRootNode = false,
    includeDevDeps = false,
    packageLock,
    maxDepth,
    location,
    vulnerabilityStrategy = vuln.strategies.NONE,
    registry
  } = options;

  // Create TMP directory
  const tmpLocation = await fs.mkdtemp(path.join(os.tmpdir(), "/"));

  const payload: Partial<Payload> = {
    id: tmpLocation.slice(-6),
    rootDependencyName: manifest.name,
    scannerVersion: packageVersion,
    vulnerabilityStrategy,
    warnings: []
  };

  // We are dealing with an exclude Map to avoid checking a package more than one time in searchDeepDependencies
  const exclude: Map<string, Set<string>> = new Map();
  const dependencies: Map<string, Dependency> = new Map();

  {
    logger
      .start(ScannerLoggerEvents.analysis.tree)
      .start(ScannerLoggerEvents.analysis.tarball)
      .start(ScannerLoggerEvents.analysis.registry);
    const fetchedMetadataPackages = new Set<string>();
    const promisesToWait: Promise<void>[] = [];

    const locker = new Mutex({ concurrency: 5 });
    locker.on(
      MutexRelease,
      () => logger.tick(ScannerLoggerEvents.analysis.tarball)
    );

    const rootDepsOptions: treeWalker.npm.WalkOptions = {
      maxDepth,
      exclude,
      includeDevDeps,
      registry,
      packageLock
    };
    for await (const current of treeWalker.npm.walk(manifest, rootDepsOptions)) {
      const { name, version, ...currentVersion } = current;
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
      if (dependencies.has(name)) {
        const dep = dependencies.get(name)!;
        promisesToWait.push(
          manifestMetadata(name, version, dep)
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
        promisesToWait.push(packageMetadata(name, version, {
          dependency,
          logger
        }));
      }

      const scanDirOptions = {
        ref: dependency.versions[version] as any,
        location,
        tmpLocation: scanRootNode && name === manifest.name ? null : tmpLocation,
        registry
      };
      promisesToWait.push(scanDirOrArchiveEx(name, version, locker, scanDirOptions));
    }

    logger.end(ScannerLoggerEvents.analysis.tree);

    // Wait for all extraction to be done!
    await Promise.allSettled(promisesToWait);
    await timers.setImmediate();

    logger
      .end(ScannerLoggerEvents.analysis.tarball)
      .end(ScannerLoggerEvents.analysis.registry);
  }

  const { hydratePayloadDependencies, strategy } = await vuln.setStrategy(vulnerabilityStrategy);
  await hydratePayloadDependencies(dependencies as any, {
    useStandardFormat: true,
    path: location
  });

  payload.vulnerabilityStrategy = strategy;

  // We do this because it "seem" impossible to link all dependencies in the first walk.
  // Because we are dealing with package only one time it may happen sometimes.
  const globalWarnings: string[] = [];
  for (const [packageName, dependency] of dependencies) {
    const metadataIntegrities = dependency.metadata?.integrity ?? {};

    for (const [version, integrity] of Object.entries(metadataIntegrities)) {
      const dependencyVer = dependency.versions[version] as DependencyVersion;

      // @ts-ignore
      const isEmptyPackage = dependencyVer.warnings.some((warning) => warning.kind === "empty-package");
      if (isEmptyPackage) {
        globalWarnings.push(`${packageName}@${version} only contain a package.json file!`);
      }

      if (!("integrity" in dependencyVer) || dependencyVer.flags.includes("isGit")) {
        continue;
      }

      if (dependencyVer.integrity !== integrity) {
        globalWarnings.push(`${packageName}@${version} manifest & tarball integrity doesn't match!`);
      }
    }
    for (const version of Object.entries(dependency.versions)) {
      const [verStr, verDescriptor] = version as [string, DependencyVersion];
      verDescriptor.flags.push(
        ...addMissingVersionFlags(new Set(verDescriptor.flags), dependency)
      );

      const usedDeps = exclude.get(`${packageName}@${verStr}`) || new Set();
      if (usedDeps.size === 0) {
        continue;
      }

      const usedBy: Record<string, string> = Object.create(null);
      for (const [name, version] of [...usedDeps].map((name) => name.split(" ") as [string, string])) {
        usedBy[name] = version;
      }
      Object.assign(verDescriptor.usedBy, usedBy);
    }
  }

  try {
    const { warnings, flaggedAuthors } = await getDependenciesWarnings(dependencies);
    payload.warnings = globalWarnings.concat(warnings);
    payload.flaggedAuthors = flaggedAuthors;
    payload.dependencies = Object.fromEntries(dependencies);

    return payload as Payload;
  }
  finally {
    await timers.setImmediate();
    await fs.rm(tmpLocation, { recursive: true, force: true });

    logger.emit(ScannerLoggerEvents.done);
  }
}

async function scanDirOrArchiveEx(
  name: string,
  version: string,
  locker: Mutex,
  options: scanDirOrArchiveOptions
) {
  const free = await locker.acquire();

  try {
    await scanDirOrArchive(name, version, options);
  }
  catch {
    // ignore
  }
  finally {
    free();
  }
}
