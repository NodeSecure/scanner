// Import Node.js Dependencies
import path from "node:path";
import os from "node:os";
import fs from "node:fs";
import assert from "node:assert";
import { describe, after, test, before } from "node:test";

// Import Third-party Dependencies
import is from "@slimio/is";

// Import Internal Dependencies
import * as github from "../src/index.js";

describe("downloadAndExtract", () => {
  let tempDownloadDir: string;

  before(() => {
    tempDownloadDir = fs.mkdtempSync(
      path.join(os.tmpdir(), "nsecure-gitlab-")
    );
  });

  after(() => {
    fs.rmSync(tempDownloadDir, { recursive: true, force: true });
  });

  test("should export as an asyncFunction", () => {
    assert.ok(is.func(github.downloadAndExtract));
    assert.ok(is.asyncFunction(github.downloadAndExtract));
  });

  test("download public repository (with extraction)", async() => {
    const result = await github.downloadAndExtract("SlimIO.is", {
      dest: tempDownloadDir,
      branch: "master"
    });

    assert.strictEqual(
      result.location,
      path.join(tempDownloadDir, "is-master")
    );
    assert.ok(fs.statSync(result.location).isDirectory());
    assert.throws(
      () => fs.accessSync(path.join(tempDownloadDir, "is-master.tar.gz")),
      {
        name: "Error",
        code: "ENOENT",
        message: /no such file or directory/
      }
    );
  });

  test("download public repository (with extraction and removeArchive disabled)", async() => {
    const { location } = await github.downloadAndExtract("SlimIO.Safe-emitter", {
      dest: tempDownloadDir,
      branch: "master",
      removeArchive: false
    });

    fs.accessSync(
      path.join(tempDownloadDir, "Safe-emitter-master.tar.gz")
    );
    assert.strictEqual(
      location,
      path.join(tempDownloadDir, "Safe-emitter-master")
    );
    assert.ok(fs.statSync(location).isDirectory());
  });
});
