// Import Node.js Dependencies
import EventEmitter, { once } from "events";
import { test } from "node:test";
import assert from "node:assert";

// Import Third-party Dependencies
import is from "@slimio/is";

// Import Internal Dependencies
import Logger from "../../src/class/logger.class.js";

test("Logger: Creating a new class instance and assert all properties", () => {
  assert.ok(is.classObject(Logger));
  const logger = new Logger();
  assert.ok(is.map(logger.events), "logger instance as an ES6 Map of events");
  assert.equal(logger.events.size, 0, "logger events must be empty");
  assert.ok(logger instanceof EventEmitter, "Logger class must extend from Node.js EventEmitter");
});

test("Logger: Initialized event should have the right properties", () => {
  const logger = new Logger().start("foobar");
  const data = logger.events.get("foobar");
  assert.deepEqual(Object.keys(data), ["startedAt", "count"]);
});

test("Logger: triggering .count() of unknown event must return zero", () => {
  const logger = new Logger();

  assert.equal(logger.count("foobar"), 0);
});

test("Logger: triggering .start() with known event should emit event and create a new events entry", async() => {
  const logger = new Logger();
  setImmediate(() => {
    logger.start("foobar");
  });

  const [eventName] = await once(logger, "start");
  assert.equal(eventName, "foobar");
  assert.ok(logger.events.has("foobar"));
});

test("Logger: triggering .count() on a started/ticked event should return one", async() => {
  const logger = new Logger().start("foobar");
  setImmediate(() => {
    logger.tick("foobar");
  });

  const [eventName] = await once(logger, "tick");
  assert.equal(eventName, "foobar");
  assert.equal(logger.count("foobar"), 1);
});

test("Logger: triggering .end() on a started event should emit end event", async() => {
  const logger = new Logger().start("foobar");
  setImmediate(() => {
    logger.end("foobar");
  });

  const [eventName, properties] = await once(logger, "end");
  assert.equal(eventName, "foobar");
  assert.ok(typeof properties.executionTime === "number");
  assert.equal(properties.count, 0);
});

test("Logger: triggering .start() a second time should not emit an event", async() => {
  const logger = new Logger().start("foobar");

  let count = 0;
  logger.on("start", () => {
    count++;
  });

  const loggerBis = logger.start("foobar");
  assert.strictEqual(logger, loggerBis);
  assert.equal(count, 0);
});

test("Logger: triggering .end() on a unknown event should return", async() => {
  const logger = new Logger();

  let count = 0;
  logger.on("end", () => {
    count++;
  });

  const loggerBis = logger.end("foobar");
  assert.strictEqual(logger, loggerBis);
  assert.equal(count, 0);
});

test("Logger: triggering .tick() on a unknown event should return", async() => {
  const logger = new Logger();

  let count = 0;
  logger.on("tick", () => {
    count++;
  });

  const loggerBis = logger.tick("foobar");
  assert.strictEqual(logger, loggerBis);
  assert.equal(count, 0);
});
