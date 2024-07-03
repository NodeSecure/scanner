// Import Node.js Dependencies
import path from "node:path";
import fs from "node:fs/promises";
import os from "node:os";

// Import Third-party Dependencies
import combineAsyncIterators from "combine-async-iterators";
import * as iter from "itertools";
import pacote from "pacote";
import Arborist from "@npmcli/arborist";
import type { PackageJSON, ManifestVersion } from "@nodesecure/npm-types";

// Import Internal Dependencies
import * as utils from "../utils/index.js";
import { Dependency, type DependencyJSON } from "../Dependency.class.js";

// CONSTANTS
const { NPM_TOKEN } = utils;

export interface DefaultSearchOptions {
  // NOTE: find a way to remove that from options
  exclude: Map<string, Set<string>>;
  /**
   * URL to the registry to use
   */
  registry?: string;
}

export interface SearchOptions extends DefaultSearchOptions {
  parent: Dependency;
  maxDepth: number;
  currDepth?: number;
}

export async function* searchDependencies(
  packageName: string,
  gitURL: string | null,
  options: SearchOptions
): AsyncIterableIterator<Dependency> {
  const { exclude, currDepth = 0, parent, maxDepth, registry } = options;

  const { name, version, deprecated, ...pkg } = await pacote.manifest(gitURL ?? packageName, {
    ...NPM_TOKEN,
    registry,
    cache: `${os.homedir()}/.npm`
  });
  const { dependencies, customResolvers, alias } = utils.mergeDependencies(pkg);

  const current = new Dependency(name, version, parent);
  current.alias = Object.fromEntries(alias);

  if (gitURL !== null) {
    current.isGit(gitURL);
    try {
      await pacote.manifest(`${name}@${version}`, {
        ...NPM_TOKEN,
        registry,
        cache: `${os.homedir()}/.npm`
      });
    }
    catch {
      current.existOnRemoteRegistry = false;
    }
  }
  current.addFlag("isDeprecated", deprecated === true);
  current.addFlag("hasCustomResolver", customResolvers.size > 0);
  current.addFlag("hasDependencies", dependencies.size > 0);

  if (currDepth !== maxDepth) {
    const config = {
      exclude, currDepth: currDepth + 1, parent: current, maxDepth, registry
    };

    const gitDependencies = iter.filter(
      customResolvers.entries(),
      ([, valueStr]) => utils.isGitDependency(valueStr)
    );
    for (const [depName, valueStr] of gitDependencies) {
      yield* searchDependencies(depName, valueStr, config);
    }

    const depsNames = await Promise.all(
      iter.map(dependencies.entries(), utils.getCleanDependencyName)
    );
    for (const [fullName, cleanName, isLatest] of depsNames) {
      if (!isLatest) {
        current.addFlag("hasOutdatedDependency");
      }

      if (exclude.has(cleanName)) {
        current.addChildren();
        exclude.get(cleanName)!.add(current.fullName);
      }
      else {
        exclude.set(cleanName, new Set([current.fullName]));
        yield* searchDependencies(fullName, null, config);
      }
    }
  }

  yield current;
}

export interface SearchLockOptions extends DefaultSearchOptions {
  parent: Dependency;
  to: Arborist.Node;
  includeDevDeps?: boolean;
  fetchManifest?: boolean;
}

export async function* searchLockDependencies(
  currentPackageName: string,
  options: SearchLockOptions
): AsyncIterableIterator<Dependency> {
  const { to, parent, exclude, fetchManifest = false, includeDevDeps, registry } = options;
  const { version, integrity = to.integrity } = to.package;

  const updatedVersion = version === "*" || typeof version === "undefined" ? "latest" : version;
  const current = new Dependency(currentPackageName, updatedVersion, parent);
  current.dev = to.dev;

  if (fetchManifest && !includeDevDeps) {
    const { _integrity, ...pkg } = await pacote.manifest(`${currentPackageName}@${updatedVersion}`, {
      ...NPM_TOKEN,
      registry,
      cache: `${os.homedir()}/.npm`
    });
    const { customResolvers, alias } = utils.mergeDependencies(pkg);

    current.alias = Object.fromEntries(alias);
    current.addFlag("hasValidIntegrity", _integrity === integrity);
    current.addFlag("isDeprecated");
    current.addFlag("hasCustomResolver", customResolvers.size > 0);

    if (to.resolved && utils.isGitDependency(to.resolved)) {
      current.isGit(to.resolved);
    }
  }
  current.addFlag("hasDependencies", to.edgesOut.size > 0);

  for (const [packageName, { to: toNode }] of to.edgesOut) {
    if (toNode === null || (!includeDevDeps && toNode.dev)) {
      continue;
    }
    const cleanName = `${packageName}@${toNode.package.version}`;

    if (exclude.has(cleanName)) {
      current.addChildren();
      exclude.get(cleanName)!.add(current.fullName);
    }
    else {
      exclude.set(cleanName, new Set([current.fullName]));
      yield* searchLockDependencies(packageName, { parent: current, to: toNode, exclude, registry });
    }
  }
  yield current;
}

export interface WalkOptions extends DefaultSearchOptions {
  /**
   * Specifies the maximum depth to traverse for each root dependency.
   * For example, a value of 2 would mean only traversing dependencies and their immediate dependencies.
   *
   * @default 4
   */
  maxDepth?: number;

  /**
   * Includes development dependencies in the walk.
   * Note that enabling this option can significantly increase processing time.
   *
   * @default false
   */
  includeDevDeps?: boolean;

  /**
   * Enables the use of Arborist for rapidly walking over the dependency tree.
   * When enabled, it triggers different methods based on the presence of `node_modules`:
   * - `loadActual()` if `node_modules` is available.
   * - `loadVirtual()` otherwise.
   *
   * When disabled, it will iterate on all dependencies by using pacote
   */
  packageLock?: {
    /**
     * Fetches all manifests for additional metadata.
     * This option is useful only when `usePackageLock` is enabled.
     *
     * @default false
     */
    fetchManifest?: boolean;

    /**
     * Specifies the location of the manifest file for Arborist.
     * This is typically the path to the `package.json` file.
     */
    location: string;
  };
}

export async function* walk(
  manifest: PackageJSON | ManifestVersion,
  options: WalkOptions
): AsyncIterableIterator<DependencyJSON> {
  const {
    maxDepth = 4,
    exclude,
    packageLock = null,
    includeDevDeps = false,
    registry
  } = options;

  const { dependencies, customResolvers, alias } = utils.mergeDependencies(manifest, void 0);
  const parent = new Dependency(manifest.name, manifest.version);
  parent.alias = Object.fromEntries(alias);

  try {
    await pacote.manifest(`${manifest.name}@${manifest.version}`, {
      ...NPM_TOKEN,
      registry,
      cache: `${os.homedir()}/.npm`
    });
  }
  catch {
    parent.existOnRemoteRegistry = false;
  }
  parent.addFlag("hasCustomResolver", customResolvers.size > 0);
  parent.addFlag("hasDependencies", dependencies.size > 0);

  let iterators: AsyncIterableIterator<Dependency>[];
  if (packageLock === null) {
    const configRef = { exclude, maxDepth, parent, registry };
    iterators = [
      ...iter
        .filter(customResolvers.entries(), ([, valueStr]) => utils.isGitDependency(valueStr))
        .map(([depName, valueStr]) => searchDependencies(depName, valueStr, configRef)),
      ...iter
        .map(dependencies.entries(), ([name, ver]) => searchDependencies(`${name}@${ver}`, null, configRef))
    ];
  }
  else {
    const { location, ...packageLockOptions } = packageLock;
    const arb = new Arborist({
      ...NPM_TOKEN,
      path: location,
      registry
    });
    let tree: Arborist.Node;
    try {
      await fs.access(path.join(location, "node_modules"));
      tree = await arb.loadActual();
    }
    catch {
      tree = await arb.loadVirtual();
    }

    iterators = [
      ...iter
        .filter(tree.edgesOut.entries(), ([, { to }]) => to !== null && (includeDevDeps ? true : (!to.dev || to.isWorkspace)))
        .map(([packageName, { to }]) => [packageName, to.isWorkspace ? to.target : to] as const)
        .map(([packageName, to]) => searchLockDependencies(packageName, {
          to,
          parent,
          includeDevDeps,
          exclude,
          registry,
          ...packageLockOptions
        }))
    ];
  }

  for await (const dep of combineAsyncIterators<Dependency>({}, ...iterators)) {
    yield dep.exportAsPlainObject();
  }

  // Add root dependencies to the exclude Map (because the parent is not handled by searchDependencies)
  // if we skip this the code will fail to re-link properly dependencies in the following steps
  const depsName = await Promise.all(
    iter.map(dependencies.entries(), utils.getCleanDependencyName)
  );
  for (const [, fullRange, isLatest] of depsName) {
    if (!isLatest) {
      parent.addFlag("hasOutdatedDependency");
    }
    if (exclude.has(fullRange)) {
      exclude.get(fullRange)!.add(parent.fullName);
    }
  }

  yield parent.exportAsPlainObject(0);
}
