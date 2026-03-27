// Import Node.js Dependencies
import { describe, test, beforeEach } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import {
  NpmTarballWorkerPool
} from "../src/class/NpmTarballWorkerPool.class.ts";
import type {
  ScanResultPayload
} from "../src/types.ts";
import {
  MockPooledWorker,
  capturedWorkers,
  terminateCallCount,
  resetMockState
} from "./mocks/MockPooledWorker.ts";
import type {
  PooledWorkerEvents
} from "../src/class/PooledWorker.class.ts";

// CONSTANTS
const kFakeScanResult: ScanResultPayload = {
  type: "module",
  size: 1024,
  licenses: [],
  uniqueLicenseIds: ["MIT"],
  warnings: [],
  flags: [],
  composition: {
    extensions: [".js"],
    files: ["index.js"],
    minified: [],
    unused: [],
    missing: [],
    required_files: [],
    required_nodejs: [],
    required_thirdparty: [],
    required_subpath: {}
  }
};

function kWorkerFactory(
  events: PooledWorkerEvents
): MockPooledWorker {
  return new MockPooledWorker(events);
}

describe("NpmTarballWorkerPool", () => {
  beforeEach(() => resetMockState());

  describe("construction", () => {
    test("should create 4 workers by default", async() => {
      const pool = new NpmTarballWorkerPool({
        workerFactory: kWorkerFactory
      });

      assert.strictEqual(capturedWorkers.length, 4);

      await pool.terminate();
    });

    test("should create the specified number of workers", async() => {
      const pool = new NpmTarballWorkerPool({
        workerCount: 2,
        workerFactory: kWorkerFactory
      });

      assert.strictEqual(capturedWorkers.length, 2);

      await pool.terminate();
    });
  });

  describe("scan()", () => {
    test("should resolve with the scan result when the worker completes successfully", async() => {
      const pool = new NpmTarballWorkerPool({
        workerCount: 1,
        workerFactory: kWorkerFactory
      });
      const [worker] = capturedWorkers;

      const scanPromise = pool.scan({ location: "/fake/path" });
      worker.simulateSuccess(kFakeScanResult);

      const result = await scanPromise;
      assert.deepEqual(result, kFakeScanResult);

      await pool.terminate();
    });

    test("should reject when the worker returns an error result", async() => {
      const pool = new NpmTarballWorkerPool({
        workerCount: 1,
        workerFactory: kWorkerFactory
      });
      const [worker] = capturedWorkers;

      const scanPromise = pool.scan({ location: "/fake/path" });
      worker.simulateErrorResult("scan failed: invalid package");

      await assert.rejects(
        scanPromise,
        { message: "scan failed: invalid package" }
      );

      await pool.terminate();
    });

    test("should reject immediately if the pool has already been terminated", async() => {
      const pool = new NpmTarballWorkerPool({
        workerCount: 1,
        workerFactory: kWorkerFactory
      });
      await pool.terminate();

      await assert.rejects(
        pool.scan({ location: "/fake/path" }),
        { message: "NpmTarballWorkerPool has been terminated" }
      );
    });

    test("should queue tasks when all workers are busy and dispatch them once a worker is free", async() => {
      const pool = new NpmTarballWorkerPool({
        workerCount: 1,
        workerFactory: kWorkerFactory
      });
      const [worker] = capturedWorkers;

      const scan1 = pool.scan({ location: "/fake/path/1" });
      const scan2 = pool.scan({ location: "/fake/path/2" });

      // The only worker is occupied by scan1 - scan2 must be queued.
      assert.ok(
        !worker.isAvailable,
        "Worker should be busy with the first task"
      );

      worker.simulateSuccess(kFakeScanResult);
      assert.deepEqual(await scan1, kFakeScanResult);

      // After scan1 completes the worker should have immediately picked up scan2.
      assert.ok(
        !worker.isAvailable,
        "Worker should now be processing the queued task"
      );

      worker.simulateSuccess(kFakeScanResult);
      assert.deepEqual(await scan2, kFakeScanResult);

      await pool.terminate();
    });
  });

  describe("terminate()", () => {
    test("should reject all in-flight tasks with a termination error", async() => {
      const pool = new NpmTarballWorkerPool({
        workerCount: 1,
        workerFactory: kWorkerFactory
      });
      // Start a scan but never drive the worker to completion.
      const scanPromise = pool.scan({ location: "/fake/path" });

      await pool.terminate();

      await assert.rejects(
        scanPromise,
        { message: "NpmTarballWorkerPool terminated" }
      );
    });

    test("should cause subsequent scan() calls to reject", async() => {
      const pool = new NpmTarballWorkerPool({
        workerCount: 1,
        workerFactory: kWorkerFactory
      });
      await pool.terminate();

      await assert.rejects(
        pool.scan({ location: "/fake/path" }),
        { message: "NpmTarballWorkerPool has been terminated" }
      );
    });

    test("should call terminate() on every worker", async() => {
      const pool = new NpmTarballWorkerPool({
        workerCount: 3,
        workerFactory: kWorkerFactory
      });
      await pool.terminate();

      assert.strictEqual(terminateCallCount, 3);
    });
  });

  describe("[Symbol.asyncDispose]", () => {
    test("should terminate the pool, causing subsequent scan() calls to reject", async() => {
      const pool = new NpmTarballWorkerPool({
        workerCount: 1,
        workerFactory: kWorkerFactory
      });
      await pool[Symbol.asyncDispose]();

      await assert.rejects(
        pool.scan({ location: "/fake/path" }),
        { message: "NpmTarballWorkerPool has been terminated" }
      );
    });
  });

  describe("worker errors", () => {
    test("should emit an 'error' event on the pool when a worker crashes", async() => {
      const pool = new NpmTarballWorkerPool({
        workerCount: 1,
        workerFactory: kWorkerFactory
      });
      const [worker] = capturedWorkers;

      const crashError = new Error("unexpected worker crash");
      const {
        promise: errorEventPromise, resolve
      } = Promise.withResolvers<Error>();
      pool.on("error", (error) => resolve(error));

      const scanPromise = pool.scan({ location: "/fake/path" });
      worker.simulateCrash(crashError);

      assert.strictEqual(
        await errorEventPromise,
        crashError,
        "Pool should emit the original error object"
      );
      await assert.rejects(
        scanPromise,
        { message: "unexpected worker crash" }
      );

      await pool.terminate();
    });

    test("should continue processing queued tasks after a worker crash", async() => {
      const pool = new NpmTarballWorkerPool({
        workerCount: 1,
        workerFactory: kWorkerFactory
      });
      const [worker] = capturedWorkers;

      // Suppress unhandled-error event so the test does not throw.
      pool.on("error", () => {
        // No-op
      });

      const scan1 = pool.scan({ location: "/fake/path/1" });
      const scan2 = pool.scan({ location: "/fake/path/2" });

      worker.simulateCrash(new Error("crash"));
      await assert.rejects(scan1, { message: "crash" });

      // The pool should have immediately dispatched scan2 to the recovered worker.
      assert.ok(
        !worker.isAvailable,
        "Worker should be processing the queued task after crash"
      );

      worker.simulateSuccess(kFakeScanResult);
      assert.deepEqual(await scan2, kFakeScanResult);

      await pool.terminate();
    });
  });
});
