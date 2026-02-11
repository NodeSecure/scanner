// Import Node.js Dependencies
import { describe, it, afterEach } from "node:test";
import assert from "node:assert";
import { EventEmitter } from "node:events";

// Import Third-party Dependencies
import * as npmRegistrySDK from "@nodesecure/npm-registry-sdk";

// Import Internal Dependencies
import type { DateProvider } from "../src/class/DateProvider.class.ts";
import { type LoggerEventsMap } from "../src/class/logger.class.ts";
import { StatsCollector } from "../src/class/StatsCollector.class.ts";

class FakeLogger extends EventEmitter<LoggerEventsMap> {
  errors: { error: LoggerEventsMap["error"][0]; phase: string | undefined; }[] = [];

  clear() {
    this.errors = [];
  }
}

const fakeLogger = new FakeLogger();

fakeLogger.on("error", (error, phase) => {
  fakeLogger.errors.push({ error, phase });
});

afterEach(() => {
  fakeLogger.clear();
});

describe("StatsCollectors", () => {
  describe("api calls", () => {
    it("should get the expected global start and execution time", () => {
      const dateProvider = new FakeDateProvider();
      dateProvider.setNow(1658512000000);
      const statsCollector = new StatsCollector(fakeLogger, dateProvider);
      dateProvider.setNow(1658512001000);
      const { startedAt, executionTime } = statsCollector.getStats();
      assert.strictEqual(startedAt, 1658512000000);
      assert.strictEqual(executionTime, 1000);
    });

    it("should still record the exexution time if the function being tracked throws", () => {
      const dateProvider = new FakeDateProvider();
      dateProvider.setNow(1658512000000);
      const statsCollector = new StatsCollector(fakeLogger, dateProvider);
      assert.throws(() => {
        statsCollector.track("api/test/1", "phase-1", () => {
          dateProvider.setNow(1658512001000);
          throw new Error("oh no!");
        });
      });

      const { apiCalls, apiCallsCount } = statsCollector.getStats();
      assert.strictEqual(apiCallsCount, 1);
      assert.deepEqual(apiCalls, [
        {
          name: "api/test/1",
          startedAt: 1658512000000,
          executionTime: 1000
        }

      ]);
    });

    it("should be able to track the start and execution time of external api call", async() => {
      let hasFnOneBeenCalled = false;
      let hasFnTwoBeenCalled = false;
      const dateProvider = new FakeDateProvider();
      dateProvider.setNow(1658512000000);
      const statsCollector = new StatsCollector(fakeLogger, dateProvider);
      dateProvider.setNow(1658512001001);
      const promise = statsCollector.track("api/test/1", "phase-1", () => {
        hasFnOneBeenCalled = true;

        return Promise.resolve(1);
      });

      dateProvider.setNow(1658512002000);
      const promiseResult = await promise;

      dateProvider.setNow(1658512003000);
      const fnResult = statsCollector.track("api/test/2", "phase-2", () => {
        hasFnTwoBeenCalled = true;
        dateProvider.setNow(1658512004000);

        return null;
      });
      dateProvider.setNow(1658512005000);
      const { apiCalls, apiCallsCount } = statsCollector.getStats();
      assert.strictEqual(promiseResult, 1);
      assert.strictEqual(fnResult, null);
      assert.strictEqual(hasFnOneBeenCalled, true);
      assert.strictEqual(hasFnTwoBeenCalled, true);
      assert.strictEqual(apiCallsCount, 2);
      assert.deepEqual(apiCalls, [
        {
          name: "api/test/1",
          startedAt: 1658512001001,
          executionTime: 999
        },
        {
          name: "api/test/2",
          startedAt: 1658512003000,
          executionTime: 1000
        }
      ]);
    });
  });

  describe("errors", () => {
    it("should have no errors when no tracked function throwed", () => {
      const dateProvider = new FakeDateProvider();
      const statsCollector = new StatsCollector(fakeLogger, dateProvider);
      const { errors, errorCount } = statsCollector.getStats();
      assert.strictEqual(errorCount, 0);
      assert.strictEqual(errors.length, 0);
    });

    it("should record when a sync error occurs", () => {
      const dateProvider = new FakeDateProvider();
      dateProvider.setNow(1658512000000);
      const statsCollector = new StatsCollector(fakeLogger, dateProvider);
      assert.throws(() => {
        statsCollector.track("api/test/1", "phase-1", () => {
          dateProvider.setNow(1658512001000);
          throw new Error("oh no!");
        });
      });
      const { errors, errorCount } = statsCollector.getStats();
      assert.strictEqual(errorCount, 1);
      assert.strictEqual(errors.length, 1);
      assert.partialDeepStrictEqual(errors, [{
        name: "api/test/1",
        message: "oh no!"
      }]);
      assert.strictEqual(fakeLogger.errors.length, 1);
      assert.partialDeepStrictEqual(fakeLogger.errors[0], {
        error: {
          name: "api/test/1",
          message: "oh no!",
          executionTime: 1000
        },
        phase: "phase-1"
      });
    });

    it("should record when an error that is not an instance of error occurs", () => {
      const dateProvider = new FakeDateProvider();
      dateProvider.setNow(1658512000000);
      const statsCollector = new StatsCollector(fakeLogger, dateProvider);
      assert.throws(() => {
        statsCollector.track("api/test/1", "phase-1", () => {
          dateProvider.setNow(1658512001000);
          // eslint-disable-next-line no-throw-literal
          throw null;
        });
      });
      const { errors, errorCount } = statsCollector.getStats();
      assert.strictEqual(errorCount, 1);
      assert.strictEqual(errors.length, 1);
      assert.partialDeepStrictEqual(errors, [{
        name: "api/test/1"
      }]);
      assert.strictEqual(fakeLogger.errors.length, 1);
      assert.partialDeepStrictEqual(fakeLogger.errors[0], {
        error: {
          name: "api/test/1",
          executionTime: 1000
        },
        phase: "phase-1"
      });
    });

    it("should have no errors when no async tracked function rejected", async() => {
      const dateProvider = new FakeDateProvider();
      dateProvider.setNow(1658512000000);
      const statsCollector = new StatsCollector(fakeLogger, dateProvider);
      await statsCollector.track("api/test/1", "phase-1", async() => {
        dateProvider.setNow(1658512001000);

        return Promise.resolve(42);
      });
      const { errors, errorCount } = statsCollector.getStats();
      assert.strictEqual(errorCount, 0);
      assert.strictEqual(errors.length, 0);
      assert.strictEqual(fakeLogger.errors.length, 0);
    });

    it("should record when an async error occurs", async() => {
      const dateProvider = new FakeDateProvider();
      dateProvider.setNow(1658512000000);
      const statsCollector = new StatsCollector(fakeLogger, dateProvider);
      await assert.rejects(async() => {
        await statsCollector.track("api/test/1", "phase-async", async() => {
          dateProvider.setNow(1658512001000);
          throw new Error("async oh no!");
        });
      });
      const { errors, errorCount } = statsCollector.getStats();
      assert.strictEqual(errorCount, 1);
      assert.strictEqual(errors.length, 1);
      assert.partialDeepStrictEqual(errors, [{
        name: "api/test/1",
        message: "async oh no!"
      }]);
      assert.strictEqual(fakeLogger.errors.length, 1);
      assert.partialDeepStrictEqual(fakeLogger.errors[0], {
        error: {
          name: "api/test/1",
          message: "async oh no!",
          executionTime: 1000
        },
        phase: "phase-async"
      });
    });

    it("should record when an async error that is not an instance of error occurs", async() => {
      const dateProvider = new FakeDateProvider();
      dateProvider.setNow(1658512000000);
      const statsCollector = new StatsCollector(fakeLogger, dateProvider);
      await assert.rejects(async() => {
        await statsCollector.track("api/test/1", "phase-1", async() => {
          dateProvider.setNow(1658512001000);
          // eslint-disable-next-line no-throw-literal
          throw "string error";
        });
      });
      const { errors, errorCount } = statsCollector.getStats();
      assert.strictEqual(errorCount, 1);
      assert.strictEqual(errors.length, 1);
      assert.partialDeepStrictEqual(errors, [{
        name: "api/test/1"
      }]);
      assert.strictEqual(fakeLogger.errors.length, 1);
      assert.partialDeepStrictEqual(fakeLogger.errors[0], {
        error: {
          name: "api/test/1",
          executionTime: 1000
        },
        phase: "phase-1"
      });
    });

    it("should add the status code when there is an http error", async() => {
      const dateProvider = new FakeDateProvider();
      dateProvider.setNow(1658512000000);
      const statsCollector = new StatsCollector(fakeLogger, dateProvider);
      await assert.rejects(async() => {
        await statsCollector.track("api/test/1", "phase-1", async() => {
          dateProvider.setNow(1658512001000);

          return npmRegistrySDK.packument("does-not-exist");
        });
      });
      const { errors, errorCount } = statsCollector.getStats();
      assert.strictEqual(errorCount, 1);
      assert.strictEqual(errors.length, 1);
      assert.partialDeepStrictEqual(errors, [{
        name: "api/test/1",
        message: "Not Found",
        statusCode: 404
      }]);
      assert.strictEqual(fakeLogger.errors.length, 1);
      assert.partialDeepStrictEqual(fakeLogger.errors[0], {
        error: {
          name: "api/test/1",
          message: "Not Found",
          statusCode: 404,
          executionTime: 1000
        },
        phase: "phase-1"
      });
    });
  });
});

class FakeDateProvider implements DateProvider {
  #now: number;
  now(): number {
    return this.#now;
  }
  oneYearAgo(): Date {
    return new Date(Date.now() - (365 * 24 * 60 * 60 * 1000));
  }

  setNow(now: number) {
    this.#now = now;
  }
}
