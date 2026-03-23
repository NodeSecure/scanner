// Import Node.js Dependencies
import { test, describe } from "node:test";
import assert from "node:assert";
import * as fs from "node:fs";
import path from "node:path";
import os from "node:os";

// Import Internal Dependencies
import { parseNpmRc, readNpmRc, getRegistryForPackage } from "../../src/utils/npmrc.ts";
import { TempDirectory } from "../../src/class/TempDirectory.class.ts";

describe("parseNpmRc", () => {
  test("should parse scoped registry entries", () => {
    const content = `
      @nodesecure-test:registry=https://npm.private-registry.test/
      @other:registry=https://other.registry.com/
    `;

    const result = parseNpmRc(content);

    assert.strictEqual(result["@nodesecure-test:registry"], "https://npm.private-registry.test/");
    assert.strictEqual(result["@other:registry"], "https://other.registry.com/");
  });

  test("should parse auth token entries", () => {
    const content = `
      //npm.private-registry.test/:_authToken=my-token
      //registry.npmjs.org/:_authToken=public-token
    `;

    const result = parseNpmRc(content);

    assert.strictEqual(result["//npm.private-registry.test/:_authToken"], "my-token");
    assert.strictEqual(result["//registry.npmjs.org/:_authToken"], "public-token");
  });

  test("should resolve environment variables", () => {
    process.env.__TEST_NPMRC_TOKEN__ = "resolved-token";

    try {
      // eslint-disable-next-line no-template-curly-in-string
      const content = "//npm.private-registry.test/:_authToken=${__TEST_NPMRC_TOKEN__}";
      const result = parseNpmRc(content);

      assert.strictEqual(result["//npm.private-registry.test/:_authToken"], "resolved-token");
    }
    finally {
      delete process.env.__TEST_NPMRC_TOKEN__;
    }
  });

  test("should resolve undefined env vars to empty string", () => {
    // eslint-disable-next-line no-template-curly-in-string
    const content = "//npm.private-registry.test/:_authToken=${UNDEFINED_VAR_NPMRC_TEST}";
    const result = parseNpmRc(content);

    assert.strictEqual(result["//npm.private-registry.test/:_authToken"], "");
  });

  test("should skip comments and empty lines", () => {
    const content = `
      # This is a comment
      ; This is also a comment
      @nodesecure-test:registry=https://npm.private-registry.test/
    `;

    const result = parseNpmRc(content);

    assert.deepStrictEqual(Object.keys(result), ["@nodesecure-test:registry"]);
  });

  test("should skip lines without equals sign", () => {
    const content = `
      no-equals-here
      @nodesecure-test:registry=https://npm.private-registry.test/
    `;

    const result = parseNpmRc(content);

    assert.strictEqual(Object.keys(result).length, 1);
    assert.strictEqual(result["@nodesecure-test:registry"], "https://npm.private-registry.test/");
  });

  test("should parse a typical .npmrc with mixed entries", () => {
    const content = `
      registry=https://registry.npmjs.org/
      always-auth=true
      //registry.npmjs.org/:_authToken=public-token
      @nodesecure-test:registry=https://npm.private-registry.test/
      //npm.private-registry.test/:_authToken=private-token
    `;

    const result = parseNpmRc(content);

    assert.strictEqual(result.registry, "https://registry.npmjs.org/");
    assert.strictEqual(result["always-auth"], "true");
    assert.strictEqual(result["//registry.npmjs.org/:_authToken"], "public-token");
    assert.strictEqual(result["@nodesecure-test:registry"], "https://npm.private-registry.test/");
    assert.strictEqual(result["//npm.private-registry.test/:_authToken"], "private-token");
  });

  test("should return empty object for empty content", () => {
    assert.deepStrictEqual(parseNpmRc(""), {});
  });
});

describe("readNpmRc", () => {
  test("should read .npmrc from given location", async() => {
    await using tempDir = await TempDirectory.create();

    const npmrcContent = `
      @nodesecure-test:registry=https://npm.private-registry.test/
      //npm.private-registry.test/:_authToken=test-token
    `;
    fs.writeFileSync(path.join(tempDir.location, ".npmrc"), npmrcContent);

    const result = await readNpmRc(tempDir.location);

    assert.strictEqual(result["@nodesecure-test:registry"], "https://npm.private-registry.test/");
    assert.strictEqual(result["//npm.private-registry.test/:_authToken"], "test-token");
  });

  test("should return entries even if location has no .npmrc", async() => {
    await using tempDir = await TempDirectory.create();

    const result = await readNpmRc(tempDir.location);

    assert.ok(typeof result === "object");
  });

  test("should merge user and project .npmrc (project wins)", async() => {
    await using tempDir = await TempDirectory.create();

    const userNpmrcPath = path.join(os.homedir(), ".npmrc");
    const userNpmrcExists = fs.existsSync(userNpmrcPath);
    const userNpmrcBackup = userNpmrcExists ? fs.readFileSync(userNpmrcPath, "utf-8") : null;

    try {
      fs.writeFileSync(userNpmrcPath, `
        //registry.npmjs.org/:_authToken=user-token
        @shared:registry=https://user.registry.com/
      `);
      fs.writeFileSync(
        path.join(tempDir.location, ".npmrc"),
        "@shared:registry=https://project.registry.com/"
      );

      const result = await readNpmRc(tempDir.location);

      assert.strictEqual(result["@shared:registry"], "https://project.registry.com/");
      assert.strictEqual(result["//registry.npmjs.org/:_authToken"], "user-token");
    }
    finally {
      if (userNpmrcBackup === null) {
        fs.unlinkSync(userNpmrcPath);
      }
      else {
        fs.writeFileSync(userNpmrcPath, userNpmrcBackup);
      }
    }
  });
});

describe("getRegistryForPackage", () => {
  const npmRcEntries = {
    "@nodesecure-test:registry": "https://npm.private-registry.test/",
    "@private:registry": "https://private.registry.com/"
  };
  const defaultRegistry = "https://registry.npmjs.org/";

  test("should return scoped registry for matching scope", () => {
    assert.strictEqual(
      getRegistryForPackage("@nodesecure-test/utils", npmRcEntries, defaultRegistry),
      "https://npm.private-registry.test/"
    );
  });

  test("should return scoped registry for another matching scope", () => {
    assert.strictEqual(
      getRegistryForPackage("@private/some-lib", npmRcEntries, defaultRegistry),
      "https://private.registry.com/"
    );
  });

  test("should return default registry for non-scoped package", () => {
    assert.strictEqual(
      getRegistryForPackage("express", npmRcEntries, defaultRegistry),
      defaultRegistry
    );
  });

  test("should return default registry for unknown scope", () => {
    assert.strictEqual(
      getRegistryForPackage("@unknown/lib", npmRcEntries, defaultRegistry),
      defaultRegistry
    );
  });

  test("should return default registry when no npmRcEntries", () => {
    assert.strictEqual(
      getRegistryForPackage("@nodesecure-test/utils", {}, defaultRegistry),
      defaultRegistry
    );
  });
});
