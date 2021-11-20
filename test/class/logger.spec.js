// Import Node.js Dependencies
import EventEmitter, { once } from "events";

// Import Third-party Dependencies
import is from "@slimio/is";
import test from "tape";

// Import Internal Dependencies
import Logger from "../../src/class/logger.class.js";

test("Logger: Creating a new class instance and assert all properties", (tape) => {
  tape.true(is.classObject(Logger));
  const logger = new Logger();
  tape.true(is.map(logger.events), "logger instance as an ES6 Map of events");
  tape.equal(logger.events.size, 0, "logger events must be empty");
  tape.true(logger instanceof EventEmitter, "Logger class must extend from Node.js EventEmitter");

  tape.end();
});

test("Logger: Initialized event should have the right properties", (tape) => {
  const logger = new Logger().start("foobar");
  const data = logger.events.get("foobar");
  tape.deepEqual(Object.keys(data), ["startedAt", "count"]);

  tape.end();
});

test("Logger: triggering .count() of unknown event must return zero", (tape) => {
  const logger = new Logger();

  tape.equal(logger.count("foobar"), 0);
  tape.end();
});

test("Logger: triggering .start() with known event should emit event and create a new events entry", async(tape) => {
  const logger = new Logger();
  setImmediate(() => {
    logger.start("foobar");
  });

  const [eventName] = await once(logger, "start");
  tape.equal(eventName, "foobar");
  tape.true(logger.events.has("foobar"));

  tape.end();
});

test("Logger: triggering .count() on a started/ticked event should return one", async(tape) => {
  const logger = new Logger().start("foobar");
  setImmediate(() => {
    logger.tick("foobar");
  });

  const [eventName] = await once(logger, "tick");
  tape.equal(eventName, "foobar");
  tape.equal(logger.count("foobar"), 1);

  tape.end();
});

test("Logger: triggering .end() on a started event should emit end event", async(tape) => {
  const logger = new Logger().start("foobar");
  setImmediate(() => {
    logger.end("foobar");
  });

  const [eventName, properties] = await once(logger, "end");
  tape.equal(eventName, "foobar");
  tape.true(typeof properties.executionTime === "number");
  tape.equal(properties.count, 0);

  tape.end();
});

test("Logger: triggering .start() a second time should not emit an event", async(tape) => {
  const logger = new Logger().start("foobar");

  let count = 0;
  logger.on("start", () => {
    count++;
  });

  const loggerBis = logger.start("foobar");
  tape.strictEqual(logger, loggerBis);
  tape.equal(count, 0);

  tape.end();
});

test("Logger: triggering .end() on a unknown event should return", async(tape) => {
  const logger = new Logger();

  let count = 0;
  logger.on("end", () => {
    count++;
  });

  const loggerBis = logger.end("foobar");
  tape.strictEqual(logger, loggerBis);
  tape.equal(count, 0);

  tape.end();
});

test("Logger: triggering .tick() on a unknown event should return", async(tape) => {
  const logger = new Logger();

  let count = 0;
  logger.on("tick", () => {
    count++;
  });

  const loggerBis = logger.tick("foobar");
  tape.strictEqual(logger, loggerBis);
  tape.equal(count, 0);

  tape.end();
});
