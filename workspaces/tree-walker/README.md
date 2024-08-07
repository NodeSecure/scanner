<p align="center"><h1 align="center">
  @nodesecure/tree-walker
</h1>

<p align="center">
  Fetch and walk the dependency tree of a given manifest
</p>

## Requirements
- [Node.js](https://nodejs.org/en/) v20 or higher

## Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i @nodesecure/tree-walker
# or
$ yarn add @nodesecure/tree-walker
```

## Usage example

```ts
import os from "node:os";

import pacote from "pacote";
import { npm } from "@nodesecure/tree-walker";

const manifest = await pacote.manifest("some-package@1.0.0", {
  cache: `${os.homedir()}/.npm`
});

const treeWalker = new npm.TreeWalker();

for await (const dependency of treeWalker.walk(manifest)) {
  console.log(dependency);
}
```

> [!NOTE]
> This package has been designed to be used by the Scanner package/workspace.

## API

### npm.TreeWalker

#### constructor(options?: TreeWalkerOptions)

```ts
import pacote from "pacote";
import Arborist from "@npmcli/arborist";

interface LocalDependencyTreeLoaderProvider {
  load(
    location: string,
    registry?: string
  ): Promise<Arborist.Node>;
}

interface PacoteProviderApi {
  manifest(
    spec: string,
    opts?: pacote.Options
  ): Promise<pacote.AbbreviatedManifest & pacote.ManifestResult>;
}

interface TreeWalkerOptions {
  registry?: string;
  providers?: {
    pacote?: PacoteProviderApi;
    localTreeLoader?: LocalDependencyTreeLoaderProvider;
  }
}
```

#### *walk(manifest: PackageJSON | ManifestVersion, options: WalkOptions): AsyncIterableIterator< DependencyJSON >

The `walk` method processes package metadata from a given **package.json file** or a **Manifest** result from the [pacote](https://www.npmjs.com/package/pacote) library.

The `options` parameter is described by the following TypeScript interface:

```ts
interface WalkOptions {
  /**
   * Specifies the maximum depth to traverse for each root dependency.
   * For example, a value of 2 would mean only traversing dependencies and their immediate dependencies.
   *
   * @default Infinity
   */
  maxDepth?: number;

  /**
   * Includes development dependencies in the walk.
   * Note that enabling this option can significantly increase processing time.
   *
   * @default false
   */
  includeDevDeps?: boolean;

  /**
   * Enables the use of Arborist for rapidly walking over the dependency tree.
   * When enabled, it triggers different methods based on the presence of `node_modules`:
   * - `loadActual()` if `node_modules` is available.
   * - `loadVirtual()` otherwise.
   *
   * When disabled, it will iterate on all dependencies by using pacote
   */
  packageLock?: {
    /**
     * Fetches all manifests for additional metadata.
     * This option is useful only when `usePackageLock` is enabled.
     *
     * @default false
     */
    fetchManifest?: boolean;

    /**
     * Specifies the location of the manifest file for Arborist.
     * This is typically the path to the `package.json` file.
     */
    location: string;
  };
}
```

## License
MIT
