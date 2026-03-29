# workingDir API

Analyze a local project by reading its `package.json` and recursively scanning its dependency tree.

```ts
import * as scanner from "@nodesecure/scanner";

const payload = await scanner.workingDir(process.cwd());
console.log(payload);
```

## Signature

```ts
function workingDir(
  location?: string,
  options?: WorkingDirOptions,
  logger?: Logger
): Promise<Scanner.Payload>
```

- `location` — path to the local project directory (must contain a `package.json`). Defaults to `process.cwd()`.
- `options` — optional configuration, see `WorkingDirOptions` below.
- `logger` — optional logger instance for tracking scan phases. See [logger](./logger.md).

## Options

> **Defaults specific to `workingDir()`:** `scanRootNode` is `true` and `includeDevDeps` is `false`.

```ts
export type WorkingDirOptions = Options & {
  /**
   * NPM runtime configuration (such as local .npmrc file).
   * It is optionally used to fetch registry authentication tokens.
   */
  npmRcConfig?: Config;

  /**
   * Optional cache lookup called after reading the local package.json.
   * If it returns a non-null Payload, the dependency walker is skipped entirely.
   */
  cacheLookup?: (
    packageJSON: PackageJSON
  ) => Promise<Payload | null>;
};

export interface Options {
  /**
   * Specifies the maximum depth to traverse for each root dependency.
   * A value of 2 would mean only traversing deps and their immediate deps.
   *
   * @default Infinity
   */
  readonly maxDepth?: number;

  /**
   * Maximum concurrency to fetch and scan NPM tarballs
   *
   * @default 8
   */
  readonly maxConcurrency?: number;

  readonly registry?: string | URL;

  /**
   * Enables the use of Arborist for rapidly walking over the dependency tree.
   * When enabled, it triggers different methods based on the presence of `node_modules`:
   * - `loadActual()` if `node_modules` is available.
   * - `loadVirtual()` otherwise.
   *
   * When disabled, it will iterate on all dependencies by using pacote.
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
   * Includes development dependencies in the walk.
   * Note that enabling this option can significantly increase I/O and processing time.
   *
   * @default false
   */
  includeDevDeps?: boolean;

  /**
   * Vulnerability strategy name (npm, snyk, node)
   *
   * @default NONE
   */
  readonly vulnerabilityStrategy?: Kind;

  /**
   * Analyze root package.
   *
   * @default true
   */
  readonly scanRootNode?: boolean;

  /**
   * Enable verbose mode
   *
   * @default false
   */
  isVerbose?: boolean;

  /**
   * Enable worker threads for parallel tarball scanning.
   * - `true` uses the default worker count (4)
   * - `number` sets an explicit worker count
   *
   * @default false
   */
  readonly workers?: boolean | number;
}
```

## Return value

Returns `Promise<Scanner.Payload>`.
See [types.ts](https://github.com/NodeSecure/scanner/blob/master/workspaces/scanner/src/types.ts) for the full type definition.

---

> [!TIP]
> See [ARCHITECTURE.md](../ARCHITECTURE.md) for internal implementation details.
