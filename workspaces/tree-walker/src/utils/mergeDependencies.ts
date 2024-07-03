// Import Third-party Dependencies
import type { PackageJSON } from "@nodesecure/npm-types";

export type NpmDependency =
  "dependencies" |
  "devDependencies" |
  "optionalDependencies" |
  "peerDependencies" |
  "bundleDependencies" |
  "bundledDependencies";

export function mergeDependencies(
  manifest: Partial<PackageJSON>,
  types: NpmDependency[] = ["dependencies"] as const
) {
  const dependencies = new Map<string, string>();
  const customResolvers = new Map<string, string>();
  const alias = new Map<string, string>();

  for (const fieldName of types) {
    if (!(fieldName in manifest)) {
      continue;
    }

    const dep = manifest[fieldName] as Record<string, string>;

    for (const [name, version] of Object.entries(dep)) {
      /**
       * Version can be file:, github:, git:, git+, ./...
       * @see https://docs.npmjs.com/cli/v7/configuring-npm/package-json#dependencies
       */
      if (/^([a-zA-Z]+:|git\+|\.\\)/.test(version)) {
        customResolvers.set(name, version);
        if (!version.startsWith("npm:")) {
          continue;
        }
        alias.set(name, version.slice(4));
      }

      dependencies.set(name, version);
    }
  }

  return { dependencies, customResolvers, alias };
}
