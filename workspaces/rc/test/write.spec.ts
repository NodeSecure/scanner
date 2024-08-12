// Import Node.js Dependencies
import * as fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import assert from "node:assert";
import { describe, it, before, beforeEach, after } from "node:test"

// Import Internal Dependencies
import { read, write, CONSTANTS } from "../src/index.js";
import { generateDefaultRC } from "../src/rc.js";

describe("write and/or update .nodesecurerc", () => {
  const location = path.join(os.tmpdir(), "rcwrite");

  before(async() => {
    await fs.mkdir(location);
  });

  beforeEach(async() => {
    await fs.rm(path.join(location, CONSTANTS.CONFIGURATION_NAME), { force: true });
    await read(location, { createIfDoesNotExist: true });
  });

  after(async() => {
    await fs.rm(location, { force: true, recursive: true });
  });

  it("should return a Node.js ENOENT Error because there is no .nodesecurerc file at the given location", async() => {
    await fs.rm(path.join(location, CONSTANTS.CONFIGURATION_NAME), { force: true });

    const payload = { ...generateDefaultRC(), version: "4.5.2" };
    const result = await write(location, { payload });

    assert(!result.ok);

    const nodejsError = result.val as NodeJS.ErrnoException;
    assert(nodejsError instanceof Error);
    assert.equal(nodejsError.code, "ENOENT");
  });

  it("should fail to write because the payload is not matching the JSON Schema", async() => {
    const payload = { foo: "bar" } as any;
    const result = await write(location, { payload });

    assert(!result.ok);

    const value = result.val as Error;
    assert(value instanceof Error);
    assert(value.message.includes("must have required property 'version'"));
  });

  it("should rewrite a complete payload (content of .nodesecurerc)", async() => {
    const payload = { ...generateDefaultRC(), version: "4.5.2" };

    const writeResult = await write(location, { payload });
    assert(writeResult.ok);
    assert.equal(writeResult.val, void 0);

    const readResult = await read(location, { createIfDoesNotExist: false });
    assert(readResult.ok);
    assert.deepEqual(readResult.val, payload);
  });

  it("should partially update payload (content of .nodesecurerc)", async() => {
    const defaultRC = generateDefaultRC();
    const payload = { i18n: "french" as const };

    const writeResult = await write(location, { payload, partialUpdate: true });
    assert(writeResult.ok);
    assert.equal(writeResult.val, void 0);

    const readResult = await read(location, { createIfDoesNotExist: false });
    assert(readResult.ok);
    assert.deepEqual(readResult.val, { ...defaultRC, ...payload });
  });
});
