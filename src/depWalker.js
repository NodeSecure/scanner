// Import Node.js Dependencies
import path from "path";
import { readFileSync, promises as fs } from "fs";
import timers from "timers/promises";
import os from "os";

// Import Third-party Dependencies
import combineAsyncIterators from "combine-async-iterators";
import iter from "itertools";
import pacote from "pacote";
import semver from "semver";
import Arborist from "@npmcli/arborist";
import Lock from "@slimio/lock";
import { packument, getLocalRegistryURL } from "@nodesecure/npm-registry-sdk";
import * as vuln from "@nodesecure/vuln";

// Import Internal Dependencies
import { mergeDependencies, constants, getCleanDependencyName, getDependenciesWarnings } from "./utils/index.js";
import { scanDirOrArchive } from "./tarball.js";
import Dependency from "./dependency.class.js";
import Logger from "./logger.class.js";

const { version: packageVersion } = JSON.parse(
  readFileSync(
    new URL(path.join("..", "package.json"), import.meta.url)
  )
);


async function* searchDeepDependencies(packageName, gitURL, options) {
  const isGit = typeof gitURL === "string";
  const { exclude, currDepth = 0, parent, maxDepth } = options;

  const { name, version, deprecated, ...pkg } = await pacote.manifest(isGit ? gitURL : packageName, {
    ...constants.NPM_TOKEN,
    registry: getLocalRegistryURL(),
    cache: `${os.homedir()}/.npm`
  });
  const { dependencies, customResolvers } = mergeDependencies(pkg);

  const current = new Dependency(name, version, parent);
  isGit && current.isGit(gitURL);
  current.addFlag("isDeprecated", deprecated === true);
  current.addFlag("hasCustomResolver", customResolvers.size > 0);
  current.addFlag("hasDependencies", dependencies.size > 0);

  if (currDepth !== maxDepth) {
    const config = {
      exclude, currDepth: currDepth + 1, parent: current, maxDepth
    };

    const gitDependencies = iter.filter(customResolvers.entries(), ([, valueStr]) => valueStr.startsWith("git+"));
    for (const [depName, valueStr] of gitDependencies) {
      yield* searchDeepDependencies(depName, valueStr.slice(4), config);
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
        yield* searchDeepDependencies(fullName, void 0, config);
      }
    }
  }

  yield current;
}

async function* deepReadEdges(currentPackageName, { to, parent, exclude, fullLockMode }) {
  const { version, integrity = to.integrity } = to.package;

  const updatedVersion = version === "*" || typeof version === "undefined" ? "latest" : version;
  const current = new Dependency(currentPackageName, updatedVersion, parent);

  if (fullLockMode) {
    const { deprecated, _integrity, ...pkg } = await pacote.manifest(`${currentPackageName}@${updatedVersion}`, {
      ...constants.NPM_TOKEN,
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

async function fetchPackageMetadata(name, version, options) {
  const { ref, locker } = options;
  const free = await locker.acquireOne();

  try {
    const pkg = await packument(name);

    const publishers = new Set();
    const oneYearFromToday = new Date();
    oneYearFromToday.setFullYear(oneYearFromToday.getFullYear() - 1);

    ref.metadata.lastVersion = pkg["dist-tags"].latest;
    if (semver.neq(version, ref.metadata.lastVersion)) {
      ref[version].flags.push("isOutdated");
    }
    ref.metadata.publishedCount = Object.values(pkg.versions).length;
    ref.metadata.lastUpdateAt = new Date(pkg.time[ref.metadata.lastVersion]);
    ref.metadata.hasReceivedUpdateInOneYear = !(oneYearFromToday > ref.metadata.lastUpdateAt);
    ref.metadata.homepage = pkg.homepage || null;
    ref.metadata.maintainers = pkg.maintainers;
    if (typeof pkg.author === "string") {
      ref.metadata.author = pkg.author;
    }
    else {
      ref.metadata.author = pkg?.author?.name ?? null;
    }

    for (const ver of Object.values(pkg.versions)) {
      const { _npmUser: npmUser, version } = ver;

      const isNullOrUndefined = typeof npmUser === "undefined" || npmUser === null;
      if (isNullOrUndefined || !("name" in npmUser) || typeof npmUser.name !== "string") {
        continue;
      }

      if (ref.metadata.author === null) {
        ref.metadata.author = npmUser.name;
      }
      else if (npmUser.name !== ref.metadata.author) {
        ref.metadata.hasManyPublishers = true;
      }

      if (!publishers.has(npmUser.name)) {
        publishers.add(npmUser.name);
        ref.metadata.publishers.push({ name: npmUser.name, version, at: new Date(pkg.time[version]) });
      }
    }

    if (ref.metadata.author === null) {
      ref.metadata.author = "N/A";
    }
  }
  catch (err) {
    // Ignore
  }
  finally {
    free();
  }
}

async function* getRootDependencies(manifest, options) {
  const { maxDepth = 4, exclude, usePackageLock, fullLockMode } = options;

  const { dependencies, customResolvers } = mergeDependencies(manifest, void 0);
  const parent = new Dependency(manifest.name, manifest.version);
  parent.addFlag("hasCustomResolver", customResolvers.size > 0);
  parent.addFlag("hasDependencies", dependencies.size > 0);

  let iterators;
  if (usePackageLock) {
    const arb = new Arborist({
      ...constants.NPM_TOKEN,
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

    iterators = iter.filter(tree.edgesOut.entries(), ([, { to }]) => !to.dev)
      .map(([packageName, { to }]) => deepReadEdges(packageName, { to, parent, fullLockMode, exclude }));
  }
  else {
    const configRef = { exclude, maxDepth, parent };
    iterators = [
      ...iter.filter(customResolvers.entries(), ([, valueStr]) => valueStr.startsWith("git+"))
        .map(([depName, valueStr]) => searchDeepDependencies(depName, valueStr.slice(4), configRef)),
      ...iter.map(dependencies.entries(), ([name, ver]) => searchDeepDependencies(`${name}@${ver}`, void 0, configRef))
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
    warnings: [],
    dependencies: new Map(),
    version: packageVersion
  };

  // We are dealing with an exclude Map to avoid checking a package more than one time in searchDeepDependencies
  const exclude = new Map();

  {
    logger.start("walkTree").start("tarball").start("registry");
    const promisesToWait = [];
    const rootDepsOptions = { maxDepth, exclude, usePackageLock, fullLockMode };

    const tarballLocker = new Lock({ maxConcurrent: 5 });
    const metadataLocker = new Lock({ maxConcurrent: 10 });
    metadataLocker.on("freeOne", () => logger.tick("registry"));
    tarballLocker.on("freeOne", () => logger.tick("tarball"));

    for await (const currentDep of getRootDependencies(manifest, rootDepsOptions)) {
      const { name, version } = currentDep;
      const current = currentDep.exportAsPlainObject(name === manifest.name ? 0 : void 0);
      let proceedDependencyAnalysis = true;

      if (payload.dependencies.has(name)) {
        // TODO: how to handle different metadata ?
        const dep = payload.dependencies.get(name);

        const currVersion = current.versions[0];
        if (currVersion in dep) {
          // The dependency has already entered the analysis
          // This happens if the package is used by multiple packages in the tree
          proceedDependencyAnalysis = false;
        }
        else {
          dep[currVersion] = current[currVersion];
          dep.versions.push(currVersion);
        }
      }
      else {
        payload.dependencies.set(name, current);
      }

      if (proceedDependencyAnalysis) {
        logger.tick("walkTree");

        promisesToWait.push(fetchPackageMetadata(name, version, {
          ref: current,
          locker: metadataLocker,
          logger
        }));
        promisesToWait.push(scanDirOrArchive(name, version, {
          ref: current[version],
          tmpLocation: forceRootAnalysis && name === manifest.name ? null : tmpLocation,
          locker: tarballLocker,
          logger
        }));
      }
    }

    logger.end("walkTree");

    // Wait for all extraction to be done!
    await Promise.allSettled(promisesToWait);
    await timers.setImmediate();

    logger.end("tarball").end("registry");
  }

  const { hydratePayloadDependencies, strategy } = await vuln.setStrategy(vulnerabilityStrategy);
  await hydratePayloadDependencies(payload.dependencies, {
    useStandardFormat: true
  });

  payload.vulnerabilityStrategy = strategy;

  // We do this because it "seem" impossible to link all dependencies in the first walk.
  // Because we are dealing with package only one time it may happen sometimes.
  for (const [packageName, descriptor] of payload.dependencies) {
    for (const verStr of descriptor.versions) {
      const fullName = `${packageName}@${verStr}`;
      const usedDeps = exclude.get(fullName) || new Set();
      if (usedDeps.size === 0) {
        continue;
      }

      const usedBy = Object.create(null);
      for (const [name, version] of [...usedDeps].map((name) => name.split(" "))) {
        usedBy[name] = version;
      }
      Object.assign(descriptor[verStr].usedBy, usedBy);
    }
  }

  try {
    payload.warnings = getDependenciesWarnings(payload.dependencies);
    payload.dependencies = Object.fromEntries(payload.dependencies);

    return payload;
  }
  finally {
    await timers.setImmediate();
    await fs.rm(tmpLocation, { recursive: true, force: true });
  }
}
