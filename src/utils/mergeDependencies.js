export function mergeDependencies(manifest, types = ["dependencies"]) {
  const dependencies = new Map();
  const customResolvers = new Map();

  for (const fieldName of types) {
    if (!Reflect.has(manifest, fieldName)) {
      continue;
    }
    const dep = manifest[fieldName];

    for (const [name, version] of Object.entries(dep)) {
      /**
       * Version can be file:, github:, git+, ./...
       * @see https://docs.npmjs.com/cli/v7/configuring-npm/package-json#dependencies
       */
      if (/^([a-zA-Z]+:|git\+|\.\\)/.test(version)) {
        customResolvers.set(name, version);
        continue;
      }

      dependencies.set(name, version);
    }
  }

  return { dependencies, customResolvers };
}
