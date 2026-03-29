// Import Node.js Dependencies
import { describe, it } from "node:test";
import assert from "node:assert/strict";

// Import Internal Dependencies
import { isNodesecurePayload } from "../../src/utils/isNodesecurePayload.ts";

describe("utils.isNodesecurePayload", () => {
  it("should return true when given a full Payload", () => {
    assert.ok(isNodesecurePayload({
      id: "abc123",
      scannerVersion: "1.0.0",
      dependencies: {}
    } as any));
  });

  it("should return false when given a dependencies map (no id or scannerVersion)", () => {
    assert.strictEqual(isNodesecurePayload({} as any), false);
  });

  it("should return false when dependencies key is missing", () => {
    assert.strictEqual(isNodesecurePayload({
      id: "abc123",
      scannerVersion: "1.0.0"
    } as any), false);
  });

  it("should return false when id key is missing", () => {
    assert.strictEqual(isNodesecurePayload({
      dependencies: {},
      scannerVersion: "1.0.0"
    } as any), false);
  });

  it("should return false when scannerVersion key is missing", () => {
    assert.strictEqual(isNodesecurePayload({
      id: "abc123",
      dependencies: {}
    } as any), false);
  });
});
