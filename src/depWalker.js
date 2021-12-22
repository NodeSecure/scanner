// Import Node.js Dependencies
import path from "path";
import { readFileSync, promises as fs } from "fs";
import timers from "timers/promises";
import os from "os";

// Import Third-party Dependencies
import combineAsyncIterators from "combine-async-iterators";
import iter from "itertools";
import pacote from "pacote";
import Arborist from "@npmcli/arborist";
import Lock from "@slimio/lock";
import * as vuln from "@nodesecure/vuln";
import { getLocalRegistryURL } from "@nodesecure/npm-registry-sdk";
import { ScannerLoggerEvents } from "./constants.js";

// Import Internal Dependencies
import {
  mergeDependencies, getCleanDependencyName, getDependenciesWarnings, addMissingVersionFlags, isGitDependency,
  NPM_TOKEN
} from "./utils/index.js";
import { scanDirOrArchive } from "./tarball.js";
import { packageMetadata } from "./npmRegistry.js";
import Dependency from "./class/dependency.class.js";
import Logger from "./class/logger.class.js";

const { version: packageVersion } = JSON.parse(
  readFileSync(
    new URL(path.join("..", "package.json"), import.meta.url)
  )
);

export async function* searchDeepDependencies(packageName, gitURL, options) {
  const { exclude, currDepth = 0, parent, maxDepth } = options;

  const { name, version, deprecated, ...pkg } = await pacote.manifest(gitURL ?? packageName, {
    ...NPM_TOKEN,
    registry: getLocalRegistryURL(),
    cache: `${os.homedir()}/.npm`
  });
  const { dependencies, customResolvers } = mergeDependencies(pkg);

  const current = new Dependency(name, version, parent);
  gitURL !== null && current.isGit(gitURL);
  current.addFlag("isDeprecated", deprecated === true);
  current.addFlag("hasCustomResolver", customResolvers.size > 0);
  current.addFlag("hasDependencies", dependencies.size > 0);

  if (currDepth !== maxDepth) {
    const config = {
      exclude, currDepth: currDepth + 1, parent: current, maxDepth
    };

    const gitDependencies = iter.filter(customResolvers.entries(), ([, valueStr]) => isGitDependency(valueStr));
    for (const [depName, valueStr] of gitDependencies) {
      yield* searchDeepDependencies(depName, valueStr, config);
    }

    const depsNames = await Promise.all(iter.map(dependencies.entries(), getCleanDependencyName));
    for (const [fullName, cleanName, isLatest] of depsNames) {
      if (!isLatest) {
        current.addFlag("hasOutdatedDependency");
      }

      if (exclude.has(cleanName)) {
        exclude.get(cleanName).add(current.fullName);
      }
      else {
        exclude.set(cleanName, new Set([current.fullName]));
        yield* searchDeepDependencies(fullName, null, config);
      }
    }
  }

  yield current;
}

export async function* deepReadEdges(currentPackageName, { to, parent, exclude, fullLockMode }) {
  const { version, integrity = to.integrity } = to.package;

  const updatedVersion = version === "*" || typeof version === "undefined" ? "latest" : version;
  const current = new Dependency(currentPackageName, updatedVersion, parent);

  if (fullLockMode) {
    const { deprecated, _integrity, ...pkg } = await pacote.manifest(`${currentPackageName}@${updatedVersion}`, {
      ...NPM_TOKEN,
      registry: getLocalRegistryURL(),
      cache: `${os.homedir()}/.npm`
    });
    const { customResolvers } = mergeDependencies(pkg);

    current.addFlag("hasValidIntegrity", _integrity === integrity);
    current.addFlag("isDeprecated");
    current.addFlag("hasCustomResolver", customResolvers.size > 0);
  }
  current.addFlag("hasDependencies", to.edgesOut.size > 0);

  for (const [packageName, { to: toNode }] of to.edgesOut) {
    if (toNode === null || toNode.dev) {
      continue;
    }
    const cleanName = `${packageName}@${toNode.package.version}`;

    if (exclude.has(cleanName)) {
      exclude.get(cleanName).add(current.fullName);
    }
    else {
      exclude.set(cleanName, new Set([current.fullName]));
      yield* deepReadEdges(packageName, { parent: current, to: toNode, exclude });
    }
  }
  yield current;
}

export async function* getRootDependencies(manifest, options) {
  const { maxDepth = 4, exclude, usePackageLock, fullLockMode } = options;

  const { dependencies, customResolvers } = mergeDependencies(manifest, void 0);
  const parent = new Dependency(manifest.name, manifest.version);
  parent.addFlag("hasCustomResolver", customResolvers.size > 0);
  parent.addFlag("hasDependencies", dependencies.size > 0);

  let iterators;
  if (usePackageLock) {
    const arb = new Arborist({
      ...NPM_TOKEN,
      registry: getLocalRegistryURL()
    });
    let tree;
    try {
      await fs.access(path.join(process.cwd(), "node_modules"));
      tree = await arb.loadActual();
    }
    catch {
      tree = await arb.loadVirtual();
    }

    iterators = iter.filter(tree.edgesOut.entries(), ([, { to }]) => to !== null && !to.dev)
      .map(([packageName, { to }]) => deepReadEdges(packageName, { to, parent, fullLockMode, exclude }));
  }
  else {
    const configRef = { exclude, maxDepth, parent };
    iterators = [
      ...iter.filter(customResolvers.entries(), ([, valueStr]) => isGitDependency(valueStr))
        .map(([depName, valueStr]) => searchDeepDependencies(depName, valueStr, configRef)),
      ...iter.map(dependencies.entries(), ([name, ver]) => searchDeepDependencies(`${name}@${ver}`, null, configRef))
    ];
  }
  for await (const dep of combineAsyncIterators({}, ...iterators)) {
    yield dep;
  }

  // Add root dependencies to the exclude Map (because the parent is not handled by searchDeepDependencies)
  // if we skip this the code will fail to re-link properly dependencies in the following steps
  const depsName = await Promise.all(iter.map(dependencies.entries(), getCleanDependencyName));
  for (const [, fullRange, isLatest] of depsName) {
    if (!isLatest) {
      parent.addFlag("hasOutdatedDependency");
    }
    if (exclude.has(fullRange)) {
      exclude.get(fullRange).add(parent.fullName);
    }
  }

  yield parent;
}

/**
 * @param {*} manifest
 * @param {*} options
 * @param {Logger} logger
 */
export async function depWalker(manifest, options = {}, logger = new Logger()) {
  const {
    forceRootAnalysis = false,
    usePackageLock = false,
    fullLockMode = false,
    maxDepth,
    vulnerabilityStrategy = vuln.strategies.NONE
  } = options;

  // Create TMP directory
  const tmpLocation = await fs.mkdtemp(path.join(os.tmpdir(), "/"));

  const payload = {
    id: tmpLocation.slice(-6),
    rootDepencyName: manifest.name,
    version: packageVersion,
    vulnerabilityStrategy,
    warnings: []
  };

  // We are dealing with an exclude Map to avoid checking a package more than one time in searchDeepDependencies
  const exclude = new Map();
  const dependencies = new Map();

  {
    logger
      .start(ScannerLoggerEvents.analysis.tree)
      .start(ScannerLoggerEvents.analysis.tarball)
      .start(ScannerLoggerEvents.analysis.registry);
    const fetchedMetadataPackages = new Set();
    const promisesToWait = [];

    const tarballLocker = new Lock({ maxConcurrent: 5 });
    tarballLocker.on("freeOne", () => logger.tick(ScannerLoggerEvents.analysis.tarball));

    const rootDepsOptions = { maxDepth, exclude, usePackageLock, fullLockMode };
    for await (const currentDep of getRootDependencies(manifest, rootDepsOptions)) {
      const { name, version } = currentDep;
      const current = currentDep.exportAsPlainObject(name === manifest.name ? 0 : void 0);
      let proceedDependencyAnalysis = true;

      if (dependencies.has(name)) {
        // TODO: how to handle different metadata ?
        const dep = dependencies.get(name);

        const currVersion = Object.keys(current.versions)[0];
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

      if (proceedDependencyAnalysis) {
        logger.tick(ScannerLoggerEvents.analysis.tree);

        // There is no need to fetch 'N' times the npm metadata for the same package.
        if (fetchedMetadataPackages.has(name)) {
          logger.tick(ScannerLoggerEvents.analysis.registry);
        }
        else {
          fetchedMetadataPackages.add(name);
          promisesToWait.push(packageMetadata(name, version, {
            ref: current,
            logger
          }));
        }

        promisesToWait.push(scanDirOrArchive(name, version, {
          ref: current.versions[version],
          tmpLocation: forceRootAnalysis && name === manifest.name ? null : tmpLocation,
          locker: tarballLocker,
          logger
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
    useStandardFormat: true
  });

  payload.vulnerabilityStrategy = strategy;

  // We do this because it "seem" impossible to link all dependencies in the first walk.
  // Because we are dealing with package only one time it may happen sometimes.
  for (const [packageName, dependency] of dependencies) {
    for (const [verStr, verDescriptor] of Object.entries(dependency.versions)) {
      verDescriptor.flags.push(...addMissingVersionFlags(new Set(verDescriptor.flags), dependency));

      const fullName = `${packageName}@${verStr}`;
      const usedDeps = exclude.get(fullName) || new Set();
      if (usedDeps.size === 0) {
        continue;
      }

      const usedBy = Object.create(null);
      for (const [name, version] of [...usedDeps].map((name) => name.split(" "))) {
        usedBy[name] = version;
      }
      Object.assign(verDescriptor.usedBy, usedBy);
    }
  }

  try {
    payload.warnings = getDependenciesWarnings(dependencies);
    payload.dependencies = Object.fromEntries(dependencies);

    return payload;
  }
  finally {
    await timers.setImmediate();
    await fs.rm(tmpLocation, { recursive: true, force: true });

    logger.emit(ScannerLoggerEvents.done);
  }
}
