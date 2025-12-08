// Import Node.js Dependencies
import { describe, test } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// Import Internal Dependencies
import { scanLockFiles, LOCK_FILES } from "../src/index.ts";

describe("scanLockFiles", () => {
  test("should scan lock files", () => {
    const output: typeof LOCK_FILES = {} as typeof LOCK_FILES;
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "/"));

    for (const [k, v] of Object.entries(LOCK_FILES)) {
      const filepath = path.join(tmpDir, v);

      fs.writeFileSync(filepath, "");
      output[k as keyof typeof LOCK_FILES] = filepath;
    }

    assert.deepEqual(scanLockFiles(tmpDir), output);
  });

  test("should return null no lockfiles", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "/"));
    assert.deepEqual(scanLockFiles(tmpDir), null);
  });
});
