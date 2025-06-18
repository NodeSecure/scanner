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

describe("download", () => {
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
    assert.ok(is.func(github.download));
    assert.ok(is.asyncFunction(github.download));
  });

  test("download must throw: repository must be a string!", () => {
    assert.rejects(
      async() => await github.download(10 as any),
      {
        name: "TypeError",
        message: "repository must be a string!"
      }
    );
  });

  test("download public repository (without extraction)", async() => {
    const { location, repository, organization } = await github.download("SlimIO.Config", {
      dest: tempDownloadDir,
      branch: "master"
    });
    assert.strictEqual(repository, "Config");
    assert.strictEqual(organization, "SlimIO");
    assert.strictEqual(location, path.join(tempDownloadDir, "Config-master.tar.gz"));

    fs.accessSync(location);
    fs.unlinkSync(location);
  });

  test("download public repository (at current working dir)", async() => {
    const { location } = await github.download("NodeSecure.utils");
    assert.strictEqual(
      location,
      path.join(process.cwd(), "utils-main.tar.gz")
    );

    fs.accessSync(location);
    fs.unlinkSync(location);
  });

  test("download private repository (without extraction)", async() => {
    const { location } = await github.download("SlimIO.Core", {
      dest: tempDownloadDir,
      branch: "master"
    });
    assert.strictEqual(
      location,
      path.join(tempDownloadDir, "Core-master.tar.gz")
    );

    fs.accessSync(location);
    fs.unlinkSync(location);
  });
});
