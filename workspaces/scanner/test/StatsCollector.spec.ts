// Import Node.js Dependencies
import { describe, it } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import type { DateProvider } from "../src/class/DateProvider.class.ts";
import { StatsCollector } from "../src/class/StatsCollector.class.ts";

describe("StatsCollectors", () => {
  it("should get the expected global start and execution time", () => {
    const dateProvider = new FakeDateProvider();
    dateProvider.setNow(1658512000000);
    const statsCollector = new StatsCollector(dateProvider);
    dateProvider.setNow(1658512001000);
    const { startedAt, executionTime } = statsCollector.getStats();
    assert.strictEqual(startedAt, 1658512000000);
    assert.strictEqual(executionTime, 1000);
  });

  it("should still record the exexution time if the function being tracked throws", () => {
    const dateProvider = new FakeDateProvider();
    dateProvider.setNow(1658512000000);
    const statsCollector = new StatsCollector(dateProvider);
    assert.throws(() => {
      statsCollector.track("api/test/1", () => {
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
    const statsCollector = new StatsCollector(dateProvider);
    dateProvider.setNow(1658512001001);
    const promise = statsCollector.track("api/test/1", () => {
      hasFnOneBeenCalled = true;

      return Promise.resolve(1);
    });

    dateProvider.setNow(1658512002000);
    const promiseResult = await promise;

    dateProvider.setNow(1658512003000);
    const fnResult = statsCollector.track("api/test/2", () => {
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
