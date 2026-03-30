# from API

Analyze a package from a remote registry (npm by default) by recursively scanning its dependency tree.

```ts
import * as scanner from "@nodesecure/scanner";

const payload = await scanner.from("fastify");
console.log(payload);
```

## Signature

```ts
function from(
  spec: string,
  options?: FromOptions,
  logger?: Logger
): Promise<Scanner.Payload>
```

- `spec` — npm package name, with optional version or semver range (e.g. `"mocha"`, `"mocha@10"`, `"mocha@^10.0.0"`).
- `options` — optional configuration, see `FromOptions` below.
- `logger` — optional logger instance for tracking scan phases. See [logger](./logger.md).

## Options

```ts
export type FromOptions = Omit<Options, "includeDevDeps"> & {
  /**
   * Optional cache lookup called after fetching the remote manifest.
   * If it returns a non-null Payload, the dependency walker is skipped entirely.
   */
  cacheLookup?: (
    manifest: pacote.AbbreviatedManifest & pacote.ManifestResult
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
   * Vulnerability strategy name (npm, snyk, node)
   *
   * @default NONE
   */
  readonly vulnerabilityStrategy?: Kind;

  /**
   * Analyze root package.
   *
   * @default false
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
