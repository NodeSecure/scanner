// Import Third-party Dependencies
import { ManifestManager } from "@nodesecure/mama";
import type { NodeImport } from "@nodesecure/npm-types";

// Import Internal Dependencies
import { getPackageName } from "./getPackageName.js";

// CONSTANTS
export const NODE_BUILTINS = new Set([
  "assert",
  "buffer",
  "child_process",
  "cluster",
  "console",
  "constants",
  "crypto",
  "dgram",
  "dns",
  "domain",
  "events",
  "fs",
  "http",
  "https",
  "module",
  "net",
  "os",
  "path",
  "punycode",
  "querystring",
  "readline",
  "repl",
  "stream",
  "string_decoder",
  "sys",
  "timers",
  "tls",
  "tty",
  "url",
  "util",
  "vm",
  "zlib",
  "freelist",
  "v8",
  "process",
  "inspector",
  "async_hooks",
  "http2",
  "perf_hooks",
  "trace_events",
  "worker_threads",
  "node:test",
  "wasi",
  "diagnostics_channel"
]);

const kFileExtensions = [".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs", ".node", ".json"];
const kExternalModules = new Set(["http", "https", "net", "http2", "dgram", "child_process"]);

export interface analyzeDependenciesOptions {
  mama:
    Pick<ManifestManager, "dependencies" | "devDependencies"> &
    Partial<Pick<ManifestManager, "nodejsImports">>;
  tryDependencies: Set<string>;
}

export interface analyzeDependenciesResult {
  nodeDependencies: string[];
  thirdPartyDependencies: string[];
  subpathImportsDependencies: Record<string, string>;
  unusedDependencies: string[];
  missingDependencies: string[];
  flags: {
    hasExternalCapacity: boolean;
    hasMissingOrUnusedDependency: boolean;
  };
}

export function analyzeDependencies(
  sourceDependencies: string[],
  options: analyzeDependenciesOptions
): analyzeDependenciesResult {
  const { mama, tryDependencies } = options;
  const { dependencies, devDependencies, nodejsImports = {} } = mama;

  // See: https://nodejs.org/api/packages.html#subpath-imports
  const subpathImportsDependencies = Object.fromEntries(
    sourceDependencies
      .filter((name) => isAliasFileModule(name) && name in nodejsImports)
      .map((name) => buildSubpathDependency(name, nodejsImports))
  );
  const thirdPartyDependenciesAliased = new Set(
    Object.values(subpathImportsDependencies).filter((mod) => !isFile(mod))
  );

  const thirdPartyDependencies = sourceDependencies.flatMap((sourceName) => {
    const name = dependencies.includes(sourceName) ? sourceName : getPackageName(sourceName);

    return isFile(name) ||
      isCoreModule(name) ||
      devDependencies.includes(name) ||
      tryDependencies.has(name) ?
      [] : name;
  });

  const unusedDependencies = difference(
    dependencies.filter((name) => !name.startsWith("@types")),
    [...thirdPartyDependencies, ...thirdPartyDependenciesAliased]
  );
  const missingDependencies = [
    ...new Set(difference(thirdPartyDependencies, dependencies))
  ]
    .filter((name: string) => !(name in nodejsImports) && !thirdPartyDependenciesAliased.has(name));
  const nodeDependencies = sourceDependencies.filter((name) => isCoreModule(name));

  const hasMissingOrUnusedDependency =
    unusedDependencies.length > 0 ||
    missingDependencies.length > 0;

  return {
    nodeDependencies,
    thirdPartyDependencies: [...new Set(thirdPartyDependencies)],
    subpathImportsDependencies,
    unusedDependencies,
    missingDependencies,

    flags: {
      hasExternalCapacity: nodeDependencies.some((depName) => kExternalModules.has(depName)),
      hasMissingOrUnusedDependency
    }
  };
}

function difference<T>(arr1: T[], arr2: T[]): T[] {
  return arr1.filter((item) => !arr2.includes(item));
}

function isFile(
  filePath: string
) {
  return filePath.startsWith(".")
    || kFileExtensions.some((extension) => filePath.endsWith(extension));
}

function isCoreModule(
  moduleName: string
): boolean {
  const cleanModuleName = moduleName.startsWith("node:") ? moduleName.slice(5) : moduleName;

  // Note: We need to also check moduleName because builtins package only return true for 'node:test'.
  return NODE_BUILTINS.has(cleanModuleName) || NODE_BUILTINS.has(moduleName);
}

function isAliasFileModule(
  moduleName: string
): moduleName is `#${string}` {
  return moduleName.charAt(0) === "#";
}

function buildSubpathDependency(
  alias: string,
  nodeImports: Record<string, string | NodeImport>
): [string, string] {
  const importEntry = nodeImports[alias]!;

  return typeof importEntry === "string" ?
    [alias, importEntry] :
    [alias, "node" in importEntry ? importEntry.node : importEntry.default];
}
