// Import Third-party Dependencies
import difference from "lodash.difference";
import builtins from "builtins";

// Import Internal Dependencies
import { getPackageName } from "./getPackageName.js";

// CONSTANTS
const kNodeModules = new Set(builtins({ experimental: true }));
const kExternalModules = new Set(["http", "https", "net", "http2", "dgram", "child_process"]);

export function analyzeDependencies(dependencies, deps = {}) {
  const { packageDeps, packageDevDeps, tryDependencies } = deps;

  const thirdPartyDependencies = dependencies
    .map((name) => (packageDeps.includes(name) ? name : getPackageName(name)))
    .filter((name) => !name.startsWith("."))
    .filter((name) => !kNodeModules.has(name))
    .filter((name) => !packageDevDeps.includes(name))
    .filter((name) => !tryDependencies.has(name));

  const unusedDependencies = difference(
    packageDeps.filter((name) => !name.startsWith("@types")),
    thirdPartyDependencies
  );
  const missingDependencies = [...new Set(difference(thirdPartyDependencies, packageDeps))];
  const nodeDependencies = dependencies.filter((name) => kNodeModules.has(name));

  return {
    nodeDependencies,
    thirdPartyDependencies: [...new Set(thirdPartyDependencies)],
    unusedDependencies,
    missingDependencies,

    flags: {
      hasExternalCapacity: nodeDependencies.some((depName) => kExternalModules.has(depName)),
      hasMissingOrUnusedDependency: unusedDependencies.length > 0 || missingDependencies.length > 0
    }
  };
}
