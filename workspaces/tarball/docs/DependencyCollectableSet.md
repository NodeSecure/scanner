# DependencyCollectableSet

**DependencyCollectableSet** is a `CollectableSet` implementation (from `@nodesecure/js-x-ray`) that intercepts and classifies every `import`/`require` encountered during a tarball scan. It separates Node.js built-ins, third-party packages, subpath imports, and local file references—and cross-checks them against the package manifest to detect unused or missing dependencies.

## Usage example

The most common way to use `DependencyCollectableSet` is to plug it into `NpmTarball.scanFiles` via the `collectables` option:

```ts
import { ManifestManager } from "@nodesecure/mama";
import {
  NpmTarball,
  DependencyCollectableSet
} from "@nodesecure/tarball";

const mama = await ManifestManager.fromPackageJSON(location);

const dependencySet = new DependencyCollectableSet(mama);
const tarex = new NpmTarball(mama);

await tarex.scanFiles({
  collectables: [dependencySet]
});

const {
  files, dependenciesInTryBlock, dependencies, flags
} = dependencySet.extract();

console.log(dependencies.thirdparty);   // ["express", "lodash", ...]
console.log(dependencies.missing);      // packages imported but not declared in package.json
console.log(dependencies.unused);       // packages declared but never imported
console.log(flags.hasExternalCapacity); // true if http, net, child_process, etc. are used
```

> [!NOTE]
> `DependencyCollectableSet` is already used internally by `scanPackageCore`. You only need to instantiate it directly when building a custom scanning pipeline on top of `NpmTarball`.

## API

### `constructor(mama: Pick<ManifestManager, "dependencies" | "devDependencies" | "nodejsImports">)`

Creates a new instance bound to a package manifest. The manifest is used to classify dependencies and detect unused/missing ones.

### `extract(): DependencyCollectableSetExtract`

Returns the full dependency analysis after scanning is complete. Call this once `NpmTarball.scanFiles` (or equivalent) has resolved.

```ts
interface DependencyCollectableSetExtract {
  /**
   * Set of relative file paths (local imports) discovered during analysis,
   * e.g. `./utils.js` or `../helpers/index.js`.
   */
  files: Set<string>;
  /**
   * List of dependency specifiers that were imported inside a `try` block,
   * indicating optional or fault-tolerant usage.
   */
  dependenciesInTryBlock: string[];
  dependencies: {
    /**
     * Node.js built-in module names referenced by the package,
     * e.g. `fs`, `path`, `node:crypto`.
     */
    nodeJs: string[];
    /**
     * Third-party npm packages imported by the package
     * (excluding dev dependencies and aliased subpath imports).
     */
    thirdparty: string[];
    /**
     * Map of Node.js subpath import aliases (keys starting with `#`) to
     * their resolved specifiers, as declared in `package.json#imports`.
     */
    subpathImports: Record<string, string>;
    /**
     * Production dependencies declared in `package.json` that are never
     * imported by the package's source files.
     */
    unused: string[];
    /**
     * Third-party packages that are imported but not listed as production
     * dependencies in `package.json`.
     */
    missing: string[];
  };
  flags: {
    /**
     * `true` when the package imports a built-in or third-party module
     * known to enable outbound network or process-spawning capabilities
     * (e.g. `http`, `net`, `child_process`, `undici`, `axios`).
     */
    hasExternalCapacity: boolean;
    /**
     * `true` when at least one dependency is unused or missing,
     * signalling a potential discrepancy between declared and actual dependencies.
     */
    hasMissingOrUnusedDependency: boolean;
  };
}
```

### `add(value: string, infos: CollectableInfos<DependencyCollectableSetMetadata>)`

Called automatically by `@nodesecure/js-x-ray` for each dependency encountered while analysing a file. You do not need to call this manually.

Each recorded entry is stored in the public `dependencies` map:

```ts
dependencySet.dependencies[relativeFile][importedName] = {
  unsafe: boolean,  // flagged as potentially unsafe by js-x-ray
  inTry: boolean,   // import is inside a try/catch block
  location: SourceArrayLocation
};
```

### `values(): Set<string>`

Returns the raw set of every dependency string collected across all files (before classification).

### `type: "dependency"`

Identifies this collectable to the js-x-ray engine.

### `dependencies: Record<string, Record<string, Dependency & { location: SourceArrayLocation }>>`

Public map of every import, indexed by the relative file path in which it was found, then by the import specifier. Useful for building per-file dependency graphs.

## `DependencyCollectableSetMetadata`

Every import recorded during a scan is stored in the public `dependencies` map alongside a metadata object of this type:

```ts
type DependencyCollectableSetMetadata = {
  /** Path of the source file (relative to the package root) where this import was found. */
  relativeFile: string;
  /**
   * Set to `true` by js-x-ray when the import expression was flagged as suspicious —
   * e.g. a dynamic `require` built from string concatenation or an obfuscated specifier.
   */
  unsafe: boolean;
  /**
   * Set to `true` when the import is wrapped in a `try/catch` block,
   * indicating optional or fault-tolerant usage.
   */
  inTry: boolean;
};
```

> [!NOTE]
> `unsafe` and `inTry` come from the base `Dependency` type defined in `@nodesecure/js-x-ray`.
