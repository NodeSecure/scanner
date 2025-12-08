// Import Node.js Dependencies
import { describe, test } from "node:test";
import assert from "node:assert";
import fs from "node:fs";

// Import Internal Dependencies
import { scanLockFiles } from "../src/index.ts";

describe("scanLockFiles", () => {
  test("should scan lock files", () => {
    fs.writeFileSync("package-lock.json", "");

    assert.deepEqual(scanLockFiles(""), {
      npm: "package-lock.json"
    });

    fs.writeFileSync("pnpm-lock.yaml", "");

    assert.deepEqual(scanLockFiles(""), {
      npm: "package-lock.json",
      pnpm: "pnpm-lock.yaml"
    });

    fs.unlinkSync("package-lock.json");
    fs.unlinkSync("pnpm-lock.yaml");
  });

  test("should return null no lockfiles", () => {
    assert.deepEqual(scanLockFiles(""), null);
  });
});
