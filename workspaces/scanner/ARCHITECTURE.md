# Scanner Architecture

This document describes the internal mechanics of how the scanner works. Both the [`from()`](./docs/from.md) and [`workingDir()`](./docs/workingDir.md) APIs follow the same pipeline once a manifest is resolved.

## Steps 0: Registry

First, we load the correct registry URL. By default, this is the local registry. The command `npm config get registry` is run on the system.

```js
const registry = options.registry ? new URL(options.registry).toString() : getLocalRegistryURL();
```

## Steps 1: Resolving the manifest

### `from()`

The first step is to fetch what we call a `Manifest` on npm for a given Spec (e.g. `mypackage@x.x.x`). For this we use the npm library [pacote](https://github.com/npm/pacote#readme) that does all the work for us.

```mermaid
graph LR;
  A[From API]-->|Spec|B[Fetching Manifest];
  B-->|npm Manifest|C[Dependency Walker];
```

It is important here to dig and learn some vocabulary related to npm:
- [Manifests](https://github.com/npm/pacote#manifests)
- [Packuments](https://github.com/npm/pacote#manifests) (We will see this later).
- Spec (This is the term used to refer to the package name with optional version or SemVer range.)

To simplify it, the first step is to check the package's existence on the remote registry and to get a structure similar to the `package.json`.

### `workingDir()`

Instead of fetching from the registry, the manifest is read directly from the local filesystem:

```js
const packagePath = path.join(location, "package.json");
const packageJSON = JSON.parse(await fs.readFile(packagePath, "utf-8"));
```

## Steps 1.1: Cache Lookup (optional)

After resolving the manifest, if a `cacheLookup` function was provided in the options, it is called with the resolved manifest. If it returns a non-null `Payload`, that value is returned immediately and the dependency walker is **never executed**. This is useful to avoid redundant network I/O when a fresh result is already available.

For `from()`, the callback receives the npm manifest:

```ts
const payload = await scanner.from("fastify", {
  cacheLookup: async(manifest) => {
    const cached = await myCache.get(`${manifest.name}@${manifest.version}`);
    return cached ?? null;
  }
});
```

For `workingDir()`, the callback receives the parsed `package.json` object instead:

```ts
const payload = await scanner.workingDir(process.cwd(), {
  cacheLookup: async(packageJSON) => {
    const cached = await myCache.get(`${packageJSON.name}@${packageJSON.version}`);
    return cached ?? null;
  }
});
```

```mermaid
graph LR;
  A[Manifest resolved]-->C{cacheLookup?};
  C-->|Payload returned|D[Return cached result];
  C-->|null returned|E[Dependency Walker];
```

## Steps 2: Dependency Walker

This step aims to identify and walk through the package dependencies (that's why we call this the dependency walker). To do this, we retrieve the dependencies from the root manifest and start a recursive mechanism.

```mermaid
graph TD;
  A[Dependency Walker]-->B[Fetch root dependencies];
  B-->C[Fetch Dependency Tree];
  C-->|RECURSIVE|C
```

> Note: at the beginning of this step we also create a temporary directory with `os.tmpdir()`

### 2.1 Fetching root dependencies

The first step is about fetching root dependencies that we previously retrieved from the manifest.

At this point we create an iterator that will contain both normal packages and packages with a git resolution. Then we use [a package](https://github.com/fraxken/combine-async-iterators) to asynchronously combine AsyncIterators.

> `from()` doesn't rely on [NPM arborist](https://www.npmjs.com/package/@npmcli/arborist) (it doesn't need a **package-lock.json** file or **node_modules** directory). When the `packageLock` option is set, Arborist is used for faster tree resolution.

```js
const configRef = { exclude, maxDepth, parent };
iterators = [
  ...iter.filter(customResolvers.entries(), ([, valueStr]) => isGitDependency(valueStr))
    .map(([depName, valueStr]) => searchDeepDependencies(depName, valueStr, configRef)),
  ...iter.map(dependencies.entries(), ([name, ver]) => searchDeepDependencies(`${name}@${ver}`, null, configRef))
];

for await (const dep of combineAsyncIterators({}, ...iterators)) {
  yield dep;
}
```

### 2.2 Fetching the dependency tree recursively

Everything is done using Async Generators, which make everything more simple by flattening dependencies. This step uses the same Manifest API from `pacote`. If a given package still has dependencies, the recursive function will continue to execute until there are no more (or it will stop if the maximum depth has been reached).

Here is a simplified version of the Generator function:

```js
export async function* searchDeepDependencies(packageName, gitURL, options) {
  const { exclude, currDepth = 1, parent, maxDepth } = options;

  const { name, version } = await pacote.manifest(gitURL ?? packageName, {
    ...NPM_TOKEN,
    registry: getLocalRegistryURL(),
    cache: `${os.homedir()}/.npm`
  });
  const { dependencies, customResolvers } = mergeDependencies(pkg);

  const current = new Dependency(name, version, parent);
  if (currDepth < maxDepth) {
    const config = {
      exclude, currDepth: currDepth + 1, parent: current, maxDepth
    };

    const depsNames = await Promise.all(iter.map(dependencies.entries(), getCleanDependencyName));
    for (const [fullName, cleanName, isLatest] of depsNames) {
      yield* searchDeepDependencies(fullName, null, config);
    }
  }

  yield current;
}
```

Each time a dependency is retrieved, the code runs two separate analyses in parallel:
- Tarball scanning (using `pacote.extract`)
- Fetching additional metadata from the registry

## Steps 3: Apply vulnera strategy

The third step is to recover the list of vulnerabilities using the active [vulnera](https://github.com/NodeSecure/vulnera) strategy (or nothing if no strategy is chosen).

```js
const { hydratePayloadDependencies, strategy } = await vuln.setStrategy(vulnerabilityStrategy);
await hydratePayloadDependencies(dependencies, {
  useStandardFormat: true,
  path: location
});
```

For more information on how to create a strategy and how they operate, please [read the following documentation](https://github.com/NodeSecure/vulnera/blob/main/docs/adding_new_strategy.md).

## Steps 4: Warnings and highlighted contacts

In this step, we look for packages or authors potentially identified as problematic (by the person requesting the analysis or by the scanner itself).

```js
const { warnings, illuminateds } = await getDependenciesWarnings(dependencies);
payload.warnings = warnings;
payload.highlighted = {
  contacts: illuminateds
};
```

By default we show warnings for the following two packages:
- `@scarf/scarf`
- `iohook`

Since the incident with [Faker](https://snyk.io/blog/npm-faker-package-open-source-libraries/) we also identify Marak's packages as dangerous.
