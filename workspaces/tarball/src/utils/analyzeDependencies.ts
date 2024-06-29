// Import Third-party Dependencies
import difference from "lodash.difference";
// @ts-ignore
import builtins from "builtins";

// Import Internal Dependencies
import { getPackageName } from "./getPackageName.js";

// CONSTANTS
const kNodeModules = new Set(builtins({ experimental: true }));
const kExternalModules = new Set(["http", "https", "net", "http2", "dgram", "child_process"]);

export interface analyzeDependenciesOptions {
  packageDeps: string[];
  packageDevDeps: string[];
  tryDependencies: Set<string>;
  nodeImports?: Record<string, any>;
}

export interface analyzeDependenciesResult {
  nodeDependencies: string[];
  thirdPartyDependencies: string[];
  subpathImportsDependencies: [string, string][];
  unusedDependencies: string[];
  missingDependencies: string[];
  flags: {
    hasExternalCapacity: boolean;
    hasMissingOrUnusedDependency: boolean;
  }
}

export function analyzeDependencies(
  dependencies: string[],
  options: analyzeDependenciesOptions
): analyzeDependenciesResult {
  const { packageDeps, packageDevDeps, tryDependencies, nodeImports = {} } = options;

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
  const missingDependencies = [...new Set<string>(difference(thirdPartyDependencies, packageDeps))]
    .filter((name: string) => !(name in nodeImports));
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
function isNodeCoreModule(moduleName: string): boolean {
  const cleanModuleName = moduleName.startsWith("node:") ? moduleName.slice(5) : moduleName;

  // Note: We need to also check moduleName because builtins package only return true for 'node:test'.
  return kNodeModules.has(cleanModuleName) || kNodeModules.has(moduleName);
}

function isAliasDependency(moduleName: string): boolean {
  return moduleName.charAt(0) === "#";
}

function buildSubpathDependency(
  alias: string,
  nodeImports: Record<string, { node?: string, default: string }>
): [string, string] {
  const importEntry = nodeImports[alias]!;
  const importedDependency = importEntry.node ?? importEntry.default;

  return [alias, importedDependency];
}
