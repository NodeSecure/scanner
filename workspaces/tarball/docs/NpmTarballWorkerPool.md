# NpmTarballWorkerPool

`NpmTarballWorkerPool` is a worker-thread-based pool for scanning multiple NPM tarballs concurrently. It maintains a fixed number of worker threads and internally queues tasks when all workers are busy, dispatching them as workers become available.

The class extends Node.js `EventEmitter`.

```ts
import { NpmTarballWorkerPool } from "@nodesecure/tarball";

await using pool = new NpmTarballWorkerPool({
  workerCount: 4
});

const results = await Promise.all([
  pool.scan({ location: "/path/to/package-a" }),
  pool.scan({ location: "/path/to/package-b" }),
  pool.scan({ location: "/path/to/package-c" }),
]);
console.log(results);
```

## API

### `new NpmTarballWorkerPool(options?)`

Creates a new worker pool and spawns the configured number of worker threads immediately.

```ts
type WorkerFactory = (events: PooledWorkerEvents) => WorkerHandle;

interface NpmTarballWorkerPoolOptions {
  /**
   * Number of workers in the pool
   * @default 4
   */
  workerCount?: number;

  /**
   * Factory used to create each worker in the pool.
   * Defaults to creating a real PooledWorker backed by a worker thread.
   * Override in tests to inject a mock without patching modules.
   */
  workerFactory?: WorkerFactory;
}
```

### `scan(task: WorkerTask): Promise<ScanResultPayload>`

Submits a scan task to the pool. If a worker is available it starts immediately; otherwise the task is queued and dispatched as soon as a worker becomes free.

```ts
interface WorkerTask {
  /**
   * Location of the package to scan (e.g. tarball path or directory path).
   */
  location: string;
  /**
   * Options for the AST analyser.
   * `collectables` is not supported and should not be provided,
   * as collectable sets are managed separately via the `collectableTypes` option.
   */
  astAnalyserOptions?: Omit<AstAnalyserOptions, "collectables">;
  /**
   * Collectable types to gather during scanning (e.g. "url", "hostname").
   * Results are serialized and returned in ScanResultPayload.collectables.
   */
  collectableTypes?: Type[];
}
```

The returned `ScanResultPayload` contains the full analysis result for the package: composition (files, extensions, dependencies), licenses, flags, warnings, and more.

> [!CAUTION]
> Calling `scan()` after `terminate()` will immediately reject the returned promise.

### `terminate(): Promise<void>`

Gracefully shuts down the pool. All running worker threads are terminated and any pending (queued) tasks are rejected with a termination error.

### `[Symbol.asyncDispose](): Promise<void>`

Called automatically by the `await using` statement. Delegates to `terminate()`.

## Events

### `error`

Emitted when a worker thread encounters an unhandled error. The associated task is rejected and the worker is returned to the available pool.

```ts
pool.on("error", (error: Error) => {
  console.error("Worker error:", error);
});
```
