// Import Node.js Dependencies
import path from "node:path";
import { readFileSync, promises as fs } from "node:fs";
import timers from "node:timers/promises";
import os from "node:os";

// Import Third-party Dependencies
import Locker from "@slimio/lock";
import { scanDirOrArchive } from "@nodesecure/tarball";
import * as vuln from "@nodesecure/vuln";
import * as treeWalker from "@nodesecure/tree-walker";
import type { PackageJson } from "@npm/types";
import pacote from "pacote";

// Import Internal Dependencies
import {
  getDependenciesWarnings, addMissingVersionFlags
} from "./utils/index.js";
import { packageMetadata, manifestMetadata } from "./npmRegistry.js";
import { Logger, ScannerLoggerEvents } from "./class/logger.class.js";
import type { DependencyVersion, Options, Payload } from "./types.js";

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
  manifest: PackageJson | pacote.AbbreviatedManifest & pacote.ManifestResult,
  options: WalkerOptions,
  logger = new Logger()
): Promise<Payload> {
  const {
    forceRootAnalysis = false,
    usePackageLock = false,
    includeDevDeps = false,
    fullLockMode = false,
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
  const dependencies: Map<string, any> = new Map();

  {
    logger
      .start(ScannerLoggerEvents.analysis.tree)
      .start(ScannerLoggerEvents.analysis.tarball)
      .start(ScannerLoggerEvents.analysis.registry);
    const fetchedMetadataPackages = new Set<string>();
    const promisesToWait: Promise<void>[] = [];

    const tarballLocker = new Locker({ maxConcurrent: 5 });
    tarballLocker.on("freeOne", () => logger.tick(ScannerLoggerEvents.analysis.tarball));

    const rootDepsOptions = {
      maxDepth, exclude, usePackageLock, fullLockMode, includeDevDeps, location, registry
    };
    for await (const currentDep of treeWalker.npm.walk(manifest, rootDepsOptions)) {
      const { name, version, dev } = currentDep;

      const current = currentDep.exportAsPlainObject(name === manifest.name ? 0 : void 0);
      let proceedDependencyAnalysis = true;

      if (dependencies.has(name)) {
        const dep = dependencies.get(name)!;
        promisesToWait.push(manifestMetadata(name, version, dep));

        const currVersion = Object.keys(current.versions)[0]!;
        if (currVersion in dep.versions) {
          // The dependency has already entered the analysis
          // This happens if the package is used by multiple packages in the tree
          proceedDependencyAnalysis = false;
        }
        else {
          dep.versions[currVersion] = current.versions[currVersion];
        }
      }
      else {
        dependencies.set(name, current);
      }

      // If the dependency is a DevDependencies we ignore it.
      if (dev) {
        continue;
      }

      if (proceedDependencyAnalysis) {
        logger.tick(ScannerLoggerEvents.analysis.tree);

        // There is no need to fetch 'N' times the npm metadata for the same package.
        if (fetchedMetadataPackages.has(name) || !current.versions[version]!.existOnRemoteRegistry) {
          logger.tick(ScannerLoggerEvents.analysis.registry);
        }
        else {
          fetchedMetadataPackages.add(name);
          promisesToWait.push(packageMetadata(name, version, {
            ref: current as any,
            logger
          }));
        }

        // TODO: re-abstract and fix ref type
        promisesToWait.push(scanDirOrArchive(name, version, {
          ref: current.versions[version] as any,
          location,
          tmpLocation: forceRootAnalysis && name === manifest.name ? null : tmpLocation,
          locker: tarballLocker,
          registry
        }));
      }
    }

    logger.end(ScannerLoggerEvents.analysis.tree);

    // Wait for all extraction to be done!
    await Promise.allSettled(promisesToWait);
    await timers.setImmediate();

    logger.end(ScannerLoggerEvents.analysis.tarball).end(ScannerLoggerEvents.analysis.registry);
  }

  const { hydratePayloadDependencies, strategy } = await vuln.setStrategy(vulnerabilityStrategy);
  await hydratePayloadDependencies(dependencies, {
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
      verDescriptor.flags.push(...addMissingVersionFlags(new Set(verDescriptor.flags), dependency));

      const usedDeps = exclude.get(`${packageName}@${verStr}`) || new Set();
      if (usedDeps.size === 0) {
        continue;
      }

      const usedBy = Object.create(null);
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
