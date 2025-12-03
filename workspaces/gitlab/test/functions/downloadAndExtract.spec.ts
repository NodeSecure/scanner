// Import Node.js Dependencies
import os from "node:os";
import path from "node:path";
import fs from "node:fs";
import assert from "node:assert";
import { describe, test, it, beforeEach, afterEach } from "node:test";

// Import Third-party Dependencies
import is from "@slimio/is";

// Import Internal Dependencies
import * as gitlab from "../../src/index.ts";

describe("downloadAndExtract", () => {
  let tempDownloadDir: string;

  beforeEach(() => {
    tempDownloadDir = fs.mkdtempSync(
      path.join(os.tmpdir(), "nsecure-gitlab-")
    );
  });

  afterEach(() => {
    fs.rmSync(tempDownloadDir, { recursive: true, force: true });
  });

  test("gitlab.downloadAndExtract should be an asyncFunction", () => {
    assert.ok(is.func(gitlab.downloadAndExtract));
    assert.ok(is.asyncFunction(gitlab.downloadAndExtract));
  });

  it("should download and extract the given gitlab repository (and not delete the tar.gz archive)", async() => {
    const { location } = await gitlab.downloadAndExtract("polychromatic.plombier-chauffagiste", {
      dest: tempDownloadDir,
      removeArchive: false
    });

    assert.ok(
      fs.existsSync(path.join(tempDownloadDir, "plombier-chauffagiste-master.tar.gz"))
    );
    assert.doesNotThrow(
      () => fs.accessSync(location)
    );
  });

  it("should download and extract the given gitlab repository (and delete the tar.gz archive)", async() => {
    const { location } = await gitlab.downloadAndExtract("polychromatic.plombier-chauffagiste", {
      dest: tempDownloadDir,
      removeArchive: true
    });

    assert.strictEqual(
      fs.existsSync(path.join(tempDownloadDir, "plombier-chauffagiste-master.tar.gz")),
      false
    );
    assert.doesNotThrow(
      () => fs.accessSync(location)
    );
  });
});
