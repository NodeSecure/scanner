// Import Third-party Dependencies
import hash from "object-hash";
import type {
  PackumentVersion,
  PackageJSON,
  PackageJSONLicense,
  WorkspacesPackageJSON
} from "@nodesecure/npm-types";

export interface PackageJSONIntegrityHashOptions {
  /**
   * Indicates whether the document originates from the NPM registry.
   *
   * @default false
   */
  isFromRemoteRegistry?: boolean;
}

export interface PackageJSONIntegrityObject {
  name: string;
  version: string;
  dependencies: Record<string, string>;
  license: string | PackageJSONLicense;
  scripts: Record<string, string>;
}

export function packageJSONIntegrityHash(
  document: PackumentVersion | PackageJSON | WorkspacesPackageJSON,
  options: PackageJSONIntegrityHashOptions = {}
): { integrity: string; object: PackageJSONIntegrityObject; } {
  const { isFromRemoteRegistry = false } = options;
  const {
    /**
     * Name and version are mandatory properties for workspaces
     */
    name = "",
    version = "",
    dependencies = {},
    license = "NONE",
    scripts = {}
  } = document;

  if (isFromRemoteRegistry) {
    // See https://github.com/npm/cli/issues/5234
    if ("install" in dependencies && dependencies.install === "node-gyp rebuild") {
      delete dependencies.install;
    }
  }

  const object: PackageJSONIntegrityObject = {
    name,
    version,
    dependencies: document?.optionalDependencies ? { ...dependencies, ...document.optionalDependencies } : dependencies,
    license,
    /**
     * Note: NPM registry automatically add `./node_modules/.bin/` to scripts
     * This artifact do not concern raw scripts in the tarball package.json.
     */
    scripts: removeNodeModulesBin(scripts)
  };

  return {
    object,
    integrity: hash(object)
  };
}

function removeNodeModulesBin(
  scripts: Record<string, string>
) {
  return Object.fromEntries(
    Object.entries(scripts).map(([key, value]) => [
      key,
      value.replaceAll("./node_modules/.bin/", "")
    ])
  );
}
