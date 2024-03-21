



  // Import Node.js Dependencies
  import path from "node:path";
  import { readFileSync, promises as fs } from "node:fs";
  import timers from "node:timers/promises";
  import os from "node:os";
  import * as iter from "itertools";

  
  // Import Third-party Dependencies
  import combineAsyncIterators from "combine-async-iterators";
  import pacote from "pacote";
  import Arborist from "@npmcli/arborist";
  
  
  
  
  // Import Internal Dependencies
  import {
    mergeDependencies, getCleanDependencyName, getDependenciesWarnings, addMissingVersionFlags, isGitDependency,
    NPM_TOKEN
  } from "./utils/index.js";

  import Dependency from "../../../src/class/dependency.class.js";
  
  
  interface ManifestInterface {
    name: string;
    version: string

  }

  interface GetRootDependenciesOptions {
    maxDepth?: number; 
    exclude: Map<number, Set<string>>; 
    usePackageLock?: boolean; 
    fullLockMode?: boolean; 
    includeDevDeps?: boolean; 
    location: string; 
    registry: string; 
}
  
  export async function* getRootDependencies(manifest : ManifestInterface, options : GetRootDependenciesOptions) {
      const {
        maxDepth = 4, exclude,
        usePackageLock, fullLockMode, includeDevDeps,
        location,
        registry
      } = options;
    
      const { dependencies, customResolvers, alias } = mergeDependencies(manifest, void 0);
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
    
      let iterators: any[];
      if (usePackageLock) {
        const arb = new Arborist({
          ...NPM_TOKEN,
          path: location,
          registry
        });
        let tree: { edgesOut: { to: any; }[]; };
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
            .map(([packageName, { to }]) => [packageName, to.isWorkspace ? to.target : to])
            .map(([packageName, to]) => deepReadEdges(packageName, {
              to,
              parent,
              fullLockMode,
              includeDevDeps,
              exclude,
              registry
            }))
        ];
      }
      else {
        const configRef = { exclude, maxDepth, parent, registry };
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
          exclude.get(fullRange)?.add(parent.fullName);
        }
      }
    
      yield parent;
    }
  
  
  
      export async function* searchDeepDependencies(packageName, gitURL, options) {
          const { exclude, currDepth = 0, parent, maxDepth, registry } = options;
        
          const { name, version, deprecated, ...pkg } = await pacote.manifest(gitURL ?? packageName, {
            ...NPM_TOKEN,
            registry,
            cache: `${os.homedir()}/.npm`
          });
          const { dependencies, customResolvers, alias } = mergeDependencies(pkg);
        
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
                current.addChildren();
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
  
        export async function* deepReadEdges(currentPackageName, options) {
          const { to, parent, exclude, fullLockMode, includeDevDeps, registry } = options;
          const { version, integrity = to.integrity } = to.package;
        
          const updatedVersion = version === "*" || typeof version === "undefined" ? "latest" : version;
          const current = new Dependency(currentPackageName, updatedVersion, parent);
          current.dev = to.dev;
        
          if (fullLockMode && !includeDevDeps) {
            const { _integrity, ...pkg } = await pacote.manifest(`${currentPackageName}@${updatedVersion}`, {
              ...NPM_TOKEN,
              registry,
              cache: `${os.homedir()}/.npm`
            });
            const { customResolvers, alias } = mergeDependencies(pkg);
        
            current.alias = Object.fromEntries(alias);
            current.addFlag("hasValidIntegrity", _integrity === integrity);
            current.addFlag("isDeprecated");
            current.addFlag("hasCustomResolver", customResolvers.size > 0);
        
            if (isGitDependency(to.resolved)) {
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
              exclude.get(cleanName).add(current.fullName);
            }
            else {
              exclude.set(cleanName, new Set([current.fullName]));
              yield* deepReadEdges(packageName, { parent: current, to: toNode, exclude, registry });
            }
          }
          yield current;
        }