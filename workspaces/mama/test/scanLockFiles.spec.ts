// Import Node.js Dependencies
import { describe, test, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// Import Internal Dependencies
import { scanLockFiles, LOCK_FILES } from "../src/index.ts";

describe("scanLockFiles", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "/"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test("should scan lock files", () => {
    const output = Array.from(createFile(tmpDir));
    assert.deepEqual(
      scanLockFiles(tmpDir),
      Object.fromEntries(output)
    );
  });

  test("should return null no lockfiles", () => {
    assert.deepEqual(scanLockFiles(tmpDir), {});
  });
});

function* createFile(tempDir: string): IterableIterator<[string, string]> {
  for (const [providerName, fileName] of Object.entries(LOCK_FILES)) {
    const filepath = path.join(tempDir, fileName);

    fs.writeFileSync(filepath, "");
    yield [providerName, fileName];
  }
}
