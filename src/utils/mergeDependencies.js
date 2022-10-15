export function mergeDependencies(manifest, types = ["dependencies"]) {
  const dependencies = new Map();
  const customResolvers = new Map();
  const alias = new Map();

  for (const fieldName of types) {
    if (!Reflect.has(manifest, fieldName)) {
      continue;
    }
    const dep = manifest[fieldName];

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
