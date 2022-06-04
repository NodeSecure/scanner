// Import Third-party Dependencies
import difference from "lodash.difference";
import builtins from "builtins";

// Import Internal Dependencies
import { getPackageName } from "./getPackageName.js";

// CONSTANTS
const kNodeModules = new Set(builtins({ experimental: true }));
const kExternalModules = new Set(["http", "https", "net", "http2", "dgram", "child_process"]);

export function analyzeDependencies(dependencies, deps = {}) {
  const { packageDeps, packageDevDeps, tryDependencies, nodeImports = {} } = deps;

  // See: https://nodejs.org/api/packages.html#subpath-imports
  const subpathImportsDependencies = dependencies
    .filter((name) => isAliasDependency(name) && name in nodeImports)
    .map((name) => buildSubpathDependency(name, nodeImports));
  const thirdPartyDependenciesAliased = new Set(
    subpathImportsDependencies.flat().filter((name) => !isAliasDependency(name))
  );

  const thirdPartyDependencies = dependencies
    .map((name) => (packageDeps.includes(name) ? name : getPackageName(name)))
    .filter((name) => !name.startsWith("."))
    .filter((name) => !isNodeCoreModule(name))
    .filter((name) => !packageDevDeps.includes(name))
    .filter((name) => !tryDependencies.has(name));

  const unusedDependencies = difference(
    packageDeps.filter((name) => !name.startsWith("@types")),
    [...thirdPartyDependencies, ...thirdPartyDependenciesAliased]
  );
  const missingDependencies = [...new Set(difference(thirdPartyDependencies, packageDeps))]
    .filter((name) => !(name in nodeImports));
  const nodeDependencies = dependencies.filter((name) => isNodeCoreModule(name));

  return {
    nodeDependencies,
    thirdPartyDependencies: [...new Set(thirdPartyDependencies)],
    subpathImportsDependencies,
    unusedDependencies,
    missingDependencies,

    flags: {
      hasExternalCapacity: nodeDependencies.some((depName) => kExternalModules.has(depName)),
      hasMissingOrUnusedDependency: unusedDependencies.length > 0 || missingDependencies.length > 0
    }
  };
}

/**
 * @param {!string} moduleName
 * @returns {boolean}
 */
function isNodeCoreModule(moduleName) {
  const cleanModuleName = moduleName.startsWith("node:") ? moduleName.slice(5) : moduleName;

  // Note: We need to also check moduleName because builtins package only return true for 'node:test'.
  return kNodeModules.has(cleanModuleName) || kNodeModules.has(moduleName);
}

function isAliasDependency(moduleName) {
  return moduleName.charAt(0) === "#";
}

function buildSubpathDependency(alias, nodeImports) {
  const importedDependency = nodeImports[alias].node ?? nodeImports[alias].default;

  return [alias, importedDependency];
}
