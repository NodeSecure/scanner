// Import Node.js Dependencies
import os from "node:os";

// Import Third-party Dependencies
import * as iter from "itertools";
import combineAsyncIterators from "combine-async-iterators";
import pacote from "pacote";
import Arborist from "@npmcli/arborist";
// @ts-ignore
import pickManifest from "npm-pick-manifest";
import { getNpmRegistryURL } from "@nodesecure/npm-registry-sdk";
import type { PackageJSON, WorkspacesPackageJSON, ManifestVersion } from "@nodesecure/npm-types";

// Import Internal Dependencies
import * as utils from "../utils/index.js";
import {
  LocalDependencyTreeLoader,
  type LocalDependencyTreeLoaderProvider
} from "./LocalDependencyTreeLoader.js";
import {
  Dependency,
  type DependencyJSON,
  type NpmSpec
} from "../Dependency.class.js";

interface BaseWalkOptions {
  parent: Dependency;
  maxDepth: number;
  currDepth?: number;
}

interface WalkRemoteOptions extends BaseWalkOptions {
  gitURL?: string;
}

interface WalkLocalOptions extends BaseWalkOptions {
  includeDevDeps?: boolean;
  fetchManifest?: boolean;
}

export interface PacoteProviderApi {
  manifest(
    spec: string,
    opts?: pacote.Options
  ): Promise<pacote.AbbreviatedManifest & pacote.ManifestResult>;
  packument(
    spec: string,
    opts?: pacote.Options
  ): Promise<pacote.AbbreviatedPackument & pacote.PackumentResult>;
}

export interface TreeWalkerOptions {
  registry?: string;
  providers?: {
    pacote?: PacoteProviderApi;
    localTreeLoader?: LocalDependencyTreeLoaderProvider;
  };
}

export interface WalkOptions {
  /**
   * Specifies the maximum depth to traverse for each root dependency.
   * For example, a value of 2 would mean only traversing dependencies and their immediate dependencies.
   *
   * @default Infinity
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

export class TreeWalker {
  /**
   * A Map of Children Spec -> Parent Spec (as a unique list)
   */
  public relationsMap: Map<NpmSpec, Set<NpmSpec>> = new Map();
  public registry: string;

  private providers: Required<Required<TreeWalkerOptions>["providers"]> = Object.seal({
    pacote,
    localTreeLoader: new LocalDependencyTreeLoader()
  });

  constructor(
    options: TreeWalkerOptions = {}
  ) {
    const { providers = {} } = options;
    this.registry = options?.registry ?? getNpmRegistryURL();

    Object.assign(this.providers, providers);
  }

  private get registryOptions() {
    return {
      ...utils.NPM_TOKEN,
      registry: this.registry,
      cache: `${os.homedir()}/.npm`
    };
  }

  private addTreeRelation(
    key: NpmSpec,
    value: NpmSpec
  ) {
    if (!this.relationsMap.has(key)) {
      return;
    }

    this.relationsMap
      .get(key)!
      .add(value);
  }

  private async resolveDependencyVersion(
    dependency: [name: string, range: string]
  ): Promise<{ rangedSpec: NpmSpec; spec: NpmSpec; isLatest: boolean; }> {
    const [dependencyName, range] = dependency;

    try {
      const packument = await this.providers.pacote.packument(
        dependencyName,
        this.registryOptions
      );
      const manifest = pickManifest(packument, range) as pacote.Manifest;

      return {
        rangedSpec: `${dependencyName}@${range}`,
        spec: `${dependencyName}@${manifest.version}`,
        isLatest: manifest.version === packument["dist-tags"].latest
      };
    }
    catch {
      return {
        rangedSpec: `${dependencyName}@${range}`,
        spec: `${dependencyName}@${utils.cleanRange(range)}`,
        isLatest: true
      };
    }
  }

  private async* walkRemoteDependency(
    spec: string,
    options: WalkRemoteOptions
  ): AsyncIterableIterator<Dependency> {
    const { currDepth = 1, parent, maxDepth, gitURL } = options;

    const { name, version, deprecated, ...pkg } = await this.providers.pacote.manifest(
      gitURL ?? spec,
      this.registryOptions
    );
    const { dependencies, customResolvers, alias } = utils.mergeDependencies(pkg);

    const current = new Dependency(name, version, {
      parent,
      alias: Object.fromEntries(alias)
    });

    if (gitURL !== null && gitURL !== undefined) {
      current.isGit(gitURL);
      try {
        await this.providers.pacote.manifest(
          `${name}@${version}`,
          this.registryOptions
        );
      }
      catch {
        current.existOnRemoteRegistry = false;
      }
    }
    current.addFlag("isDeprecated", deprecated === true);
    current.addFlag("hasCustomResolver", customResolvers.size > 0);
    current.addFlag("hasDependencies", dependencies.size > 0);

    if (currDepth < maxDepth) {
      const config: BaseWalkOptions = {
        currDepth: currDepth + 1, parent: current, maxDepth
      };

      const gitDependencies = iter.filter(
        customResolvers.entries(),
        ([, valueStr]) => utils.isGitDependency(valueStr)
      );
      for (const [depName, gitURL] of gitDependencies) {
        yield* this.walkRemoteDependency(depName, { ...config, gitURL });
      }

      const resolvedDependencies = await Promise.all(
        iter.map(dependencies.entries(), this.resolveDependencyVersion.bind(this))
      );
      for (const { rangedSpec, spec, isLatest } of resolvedDependencies) {
        if (!isLatest) {
          current.addFlag("hasOutdatedDependency");
        }

        if (this.relationsMap.has(spec)) {
          current.addChildren();
          this.relationsMap.get(spec)!.add(current.spec);
        }
        else {
          this.relationsMap.set(spec, new Set([current.spec]));

          yield* this.walkRemoteDependency(rangedSpec, config);
        }
      }
    }

    yield current;
  }

  private async* walkLocalDependency(
    packageName: string,
    node: Arborist.Node,
    options: WalkLocalOptions
  ): AsyncIterableIterator<Dependency> {
    const {
      currDepth = 1,
      maxDepth,
      parent,
      fetchManifest = false,
      includeDevDeps = false
    } = options;
    const { version, integrity = node.integrity } = node.package;

    const updatedVersion = version === "*" || typeof version === "undefined" ?
      "latest" : version;
    const current = new Dependency(packageName, updatedVersion, {
      parent,
      isDevDependency: node.dev
    });

    if (fetchManifest && !includeDevDeps) {
      const { _integrity, ...pkg } = await this.providers.pacote.manifest(
        `${packageName}@${updatedVersion}`,
        this.registryOptions
      );
      const { customResolvers, alias } = utils.mergeDependencies(pkg);

      current.alias = Object.fromEntries(alias);
      current.addFlag("hasValidIntegrity", _integrity === integrity);
      current.addFlag("isDeprecated");
      current.addFlag("hasCustomResolver", customResolvers.size > 0);

      if (node.resolved && utils.isGitDependency(node.resolved)) {
        current.isGit(node.resolved);
      }
    }
    current.addFlag("hasDependencies", node.edgesOut.size > 0);

    if (currDepth < maxDepth) {
      const config: WalkLocalOptions = {
        currDepth: currDepth + 1, parent: current, maxDepth, fetchManifest, includeDevDeps
      };

      for (const [packageName, { to: toNode }] of node.edgesOut) {
        if (toNode === null || (!includeDevDeps && toNode.dev)) {
          continue;
        }
        const spec: NpmSpec = `${packageName}@${toNode.package.version}`;

        if (this.relationsMap.has(spec)) {
          current.addChildren();
          this.relationsMap.get(spec)!.add(current.spec);
        }
        else {
          this.relationsMap.set(spec, new Set([current.spec]));

          yield* this.walkLocalDependency(packageName, toNode, config);
        }
      }
    }

    yield current;
  }

  async* walk(
    manifest: PackageJSON | WorkspacesPackageJSON | ManifestVersion,
    options: WalkOptions = {}
  ): AsyncIterableIterator<DependencyJSON> {
    this.relationsMap.clear();
    const {
      maxDepth = Infinity,
      packageLock = null,
      includeDevDeps = false
    } = options;

    const { dependencies, customResolvers, alias } = utils.mergeDependencies(manifest);
    const rootDependency = new Dependency(
      manifest?.name ?? "workspace",
      manifest?.version ?? "1.0.0",
      {
        alias: Object.fromEntries(alias)
      }
    );

    try {
      const { _integrity: integrity } = await this.providers.pacote.manifest(
        `${manifest.name}@${manifest.version}`,
        this.registryOptions
      );
      rootDependency.integrity = integrity;
    }
    catch {
      rootDependency.existOnRemoteRegistry = false;
    }
    rootDependency.addFlag("hasCustomResolver", customResolvers.size > 0);
    rootDependency.addFlag("hasDependencies", dependencies.size > 0);

    scanWithArborist: if (packageLock !== null) {
      const { location, ...packageLockOptions } = packageLock;

      let arboristNode: Arborist.Node;
      try {
        arboristNode = await this.providers.localTreeLoader.load(
          location,
          this.registry
        );
      }
      catch {
        break scanWithArborist;
      }
      const { edgesOut } = arboristNode;

      const iterators = [
        ...iter
          .filter(edgesOut.entries(), ([, { to }]) => to !== null && (includeDevDeps ? true : (!to.dev || to.isWorkspace)))
          .map(([packageName, { to }]) => [packageName, to!.isWorkspace ? to!.target : to] as const)
          .map(([packageName, to]) => this.walkLocalDependency(packageName, to!, {
            maxDepth,
            parent: rootDependency,
            includeDevDeps,
            ...packageLockOptions
          }))
      ];

      for await (const dep of combineAsyncIterators({}, ...iterators)) {
        yield dep.exportAsPlainObject();
      }

      for (const [packageName, { to: toNode }] of edgesOut) {
        if (toNode === null || (!includeDevDeps && toNode.dev)) {
          continue;
        }

        this.addTreeRelation(
          `${packageName}@${toNode.package.version}`,
          rootDependency.spec
        );
      }

      yield rootDependency.exportAsPlainObject(0);

      return;
    }

    const walkRemoteOptions = { maxDepth, parent: rootDependency };
    const iterators = [
      ...iter
        .filter(customResolvers.entries(), ([, version]) => utils.isGitDependency(version))
        .map(([name, gitURL]) => this.walkRemoteDependency(name, { ...walkRemoteOptions, gitURL })),
      ...iter
        .map(dependencies.entries(), ([name, ver]) => this.walkRemoteDependency(`${name}@${ver}`, walkRemoteOptions))
    ];

    for await (const dep of combineAsyncIterators({}, ...iterators)) {
      yield dep.exportAsPlainObject();
    }

    /**
     * Add root dependencies to the relations Map because the parent is not handled by walkRemoteDependency.
     * If we skip this step, the code will fail to properly re-link dependencies in the subsequent steps.
     */
    const resolvedDependencies = await Promise.all(
      iter.map(dependencies.entries(), this.resolveDependencyVersion.bind(this))
    );
    for (const { spec, isLatest } of resolvedDependencies) {
      if (!isLatest) {
        rootDependency.addFlag("hasOutdatedDependency");
      }
      this.addTreeRelation(spec, rootDependency.spec);
    }

    yield rootDependency.exportAsPlainObject(0);
  }
}

