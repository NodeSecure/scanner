// Import Node.js Dependencies
import assert from "node:assert";
import { describe, beforeEach, it } from "node:test";

// Import Internal Dependencies
import { generateDefaultRC, RC } from "../src/rc.js";
import { memoize, memoized, maybeMemoized, clearMemoized } from "../src/index.js";

describe("memoize", () => {
  beforeEach(() => {
    clearMemoized();
  });

  it("should store the payload in memory", () => {
    const payload = generateDefaultRC();
    memoize(payload);

    assert.deepEqual(memoized(), payload);
  });

  it("should overwrite the previous payload if the overwrite option is true", () => {
    memoize(generateDefaultRC());
    const payload: Partial<RC> = {
      version: "2.0.0",
      i18n: "french",
      strategy: "snyk"
    };
    memoize(payload, { overwrite: true });

    assert.deepEqual(memoized(), payload);
  });

  it("should merge with the previous memoized payload if overwrite option is set to false", () => {
    const rc = generateDefaultRC();
    memoize(rc, { overwrite: true });

    const payload: Partial<RC> = {
      version: "2.0.0",
      i18n: "french",
      strategy: "snyk"
    };
    memoize(payload, { overwrite: false });

    assert.deepEqual(memoized(), { ...rc, ...payload });
  });
});

describe("memoized", () => {
  beforeEach(() => {
    clearMemoized();
  });

  it("should return null when there is no memoized value", () => {
    assert.equal(memoized(), null);
  });

  it("should return previously memoized RC", () => {
    const rc = generateDefaultRC();
    memoize(rc);

    assert.deepEqual(memoized(), rc);
  });
});

describe("maybeMemoized", () => {
  beforeEach(() => {
    clearMemoized();
  });

  it("should return None when there is no memoized value", () => {
    const option = maybeMemoized();
    assert(option.none);
    assert.equal(option.unwrapOr(null), null);
  });

  it("should unwrap previously memoized RC", () => {
    const rc = generateDefaultRC();
    memoize(rc);

    const option = maybeMemoized();
    assert(option.some);
    assert.deepEqual(option.unwrap(), rc);
  });
});

describe("clearMemoized", () => {
  it("should clear memoized value", () => {
    const rc = generateDefaultRC();
    memoize(rc);

    assert.notEqual(memoized(), null);
    clearMemoized();
    assert.equal(memoized(), null);
  });
});
