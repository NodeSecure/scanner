// Import Node.js Dependencies
import EventEmitter, { once } from "node:events";
import { describe, it } from "node:test";
import assert from "node:assert";

// Import Third-party Dependencies
import is from "@slimio/is";

// Import Internal Dependencies
import { Logger } from "../src/index.ts";

describe("Logger", () => {
  it("should be a class with an empty events map extending EventEmitter", () => {
    assert.ok(is.classObject(Logger));
    const logger = new Logger();
    assert.ok(is.map(logger.events), "logger instance as an ES6 Map of events");
    assert.equal(logger.events.size, 0, "logger events must be empty");
    assert.ok(logger instanceof EventEmitter, "Logger class must extend from Node.js EventEmitter");
  });

  it("initialized event should have startedAt and count properties", () => {
    const logger = new Logger().start("foobar");
    const data = logger.events.get("foobar")!;
    assert.deepEqual(Object.keys(data), ["startedAt", "count"]);
  });

  it(".count() on unknown event should return zero", () => {
    const logger = new Logger();

    assert.equal(logger.count("foobar"), 0);
  });

  it(".start() should emit event and create a new events entry", async() => {
    const logger = new Logger();
    setImmediate(() => {
      logger.start("foobar");
    });

    const [eventName] = await once(logger, "start");
    assert.equal(eventName, "foobar");
    assert.ok(logger.events.has("foobar"));
  });

  it(".count() on a started/ticked event should return one", async() => {
    const logger = new Logger().start("foobar");
    setImmediate(() => {
      logger.tick("foobar");
    });

    const [eventName] = await once(logger, "tick");
    assert.equal(eventName, "foobar");
    assert.equal(logger.count("foobar"), 1);
  });

  it(".end() on a started event should emit end event", async() => {
    const logger = new Logger().start("foobar");
    setImmediate(() => {
      logger.end("foobar");
    });

    const [eventName, properties] = await once(logger, "end");
    assert.equal(eventName, "foobar");
    assert.ok(typeof properties.executionTime === "number");
    assert.equal(properties.count, 0);
  });

  it(".start() called a second time on same event should not emit", async() => {
    const logger = new Logger().start("foobar");

    let count = 0;
    logger.on("start", () => {
      count++;
    });

    const loggerBis = logger.start("foobar");
    assert.strictEqual(logger, loggerBis);
    assert.equal(count, 0);
  });

  it(".end() on unknown event should return without emitting", async() => {
    const logger = new Logger();

    let count = 0;
    logger.on("end", () => {
      count++;
    });

    const loggerBis = logger.end("foobar");
    assert.strictEqual(logger, loggerBis);
    assert.equal(count, 0);
  });

  it(".tick() on unknown event should return without emitting", async() => {
    const logger = new Logger();

    let count = 0;
    logger.on("tick", () => {
      count++;
    });

    const loggerBis = logger.tick("foobar");
    assert.strictEqual(logger, loggerBis);
    assert.equal(count, 0);
  });
});
