// Import Third-party Dependencies
import pacote from "pacote";

export type NpmDependency =
  "dependencies" |
  "devDependencies" |
  "optionalDependencies" |
  "peerDependencies" |
  "bundleDependencies" |
  "bundledDependencies";

export function mergeDependencies(
  manifest: Partial<pacote.AbbreviatedManifest & pacote.ManifestResult>,
  types: NpmDependency[] = ["dependencies"] as const
) {
  const dependencies = new Map();
  const customResolvers = new Map();
  const alias = new Map();

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
