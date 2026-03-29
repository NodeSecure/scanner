<p align="center">
<img alt="# Nodesecure Scanner" src="https://user-images.githubusercontent.com/4438263/226018084-113c49e6-6c69-4baa-8f84-87e6d695be6d.jpg">
</p>

## 🔎 About

**Scanner** is a Node.js static analysis tool that recursively walks dependency trees, scans npm tarballs with [JS-X-Ray](https://github.com/NodeSecure/js-x-ray), and enriches results with vulnerability data from [Vulnera](https://github.com/NodeSecure/vulnera).

## 🚧 Requirements

- [Node.js](https://nodejs.org/en/) version 22 or higher

## 💃 Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i @nodesecure/scanner
# or
$ yarn add @nodesecure/scanner
```

## 👀 Usage example

```js
import * as scanner from "@nodesecure/scanner";
import fs from "node:fs/promises";

// CONSTANTS
const kPackagesToAnalyze = ["mocha", "cacache", "is-wsl"];

const payloads = await Promise.all(
  kPackagesToAnalyze.map((name) => scanner.from(name))
);

const promises = [];
for (let i = 0; i < kPackagesToAnalyze.length; i++) {
  const data = JSON.stringify(payloads[i], null, 2);

  promises.push(fs.writeFile(`${kPackagesToAnalyze[i]}.json`, data));
}
await Promise.allSettled(promises);
```

## 📚 API

See [types.ts](https://github.com/NodeSecure/scanner/blob/master/workspaces/scanner/src/types.ts) for a complete TypeScript definition.

```ts
function workingDir(
  location: string,
  options?: Scanner.WorkingDirOptions,
  logger?: Scanner.Logger
): Promise<Scanner.Payload>;
function from(
  packageName: string,
  options?: Scanner.FromOptions,
  logger?: Scanner.Logger
): Promise<Scanner.Payload>;
function verify(
  packageName?: string
): Promise<tarball.ScannedPackageResult>;
```

`WorkingDirOptions` and `FromOptions` are described with the following TypeScript interfaces:

```ts
type WorkingDirOptions = Options & {
  /**
   * NPM runtime configuration (such as local .npmrc file)
   * It is optionally used to fetch registry authentication tokens
   */
  npmRcConfig?: Config;
  /**
   * Optional cache lookup called after reading the local package.json.
   */
  cacheLookup?: (
    packageJSON: PackageJSON
  ) => Promise<Payload | null>;
};

type FromOptions = Omit<Options, "includeDevDeps"> & {
  /**
   * Optional cache lookup called after fetching the remote manifest.
   */
  cacheLookup?: (
    manifest: pacote.AbbreviatedManifest & pacote.ManifestResult
  ) => Promise<Payload | null>;
};

interface Options {
  /**
   * Specifies the maximum depth to traverse for each root dependency.
   * A value of 2 would mean only traversing deps and their immediate deps.
   *
   * @default Infinity
   */
  readonly maxDepth?: number;

  /**
   * Maximum concurrency to fetch and scan NPM tarballs
   * @default 8
   */
  readonly maxConcurrency?: number;

  /**
   * Includes development dependencies in the walk.
   * Note that enabling this option can significantly increase I/O and processing time.
   *
   * @default false
   */
  includeDevDeps?: boolean;

  readonly registry?: string | URL;

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

  highlight?: {
    contacts?: Contact[];
    packages?: HighlightPackages;
    identifiers?: string[];
  };

  /**
   * Vulnerability strategy name (npm, snyk, node)
   *
   * @default NONE
   */
  readonly vulnerabilityStrategy?: Vuln.Strategy.Kind;

  /**
   * Analyze root package.
   *
   * @default false for from() API
   * @default true  for cwd()  API
   */
  readonly scanRootNode?: boolean;
}
```

Additional API documentation:

- [from](./docs/from.md)
- [workingDir](./docs/workingDir.md)
- [verify](./docs/verify.md)
- [extractors](./docs/extractors.md)
- [logger](./docs/logger.md)
- [Architecture](./ARCHITECTURE.md)

## License

MIT
