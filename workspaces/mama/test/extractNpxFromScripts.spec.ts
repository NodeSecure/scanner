// Import Node.js Dependencies
import assert from "node:assert";
import { describe, it } from "node:test";

// Import Internal Dependencies
import { extractNpxFromScripts } from "../src/utils/index.ts";

describe("extractNpxFromScripts", () => {
  describe("npx binary name extraction", () => {
    it("should not extract anynthing when this is not an npx command", () => {
      assert.deepEqual(Array.from(extractNpxFromScripts({ start: "npm run start" })), []);
    });

    it("should extract binary name for the simplest npx command", () => {
      assert.deepEqual(Array.from(extractNpxFromScripts({ exec: "npx my-internal-tool" })), [
        {
          binaryName: "my-internal-tool",
          flags: [],
          scriptName: "exec"
        }
      ]);
    });

    it("should extract the binary name when the npx command is not trimmed", () => {
      assert.deepEqual(Array.from(extractNpxFromScripts({ exec: "  npx my-internal-tool " })), [
        {
          binaryName: "my-internal-tool",
          flags: [],
          scriptName: "exec"
        }
      ]);
    });

    it("should extract the binary name when the npx command is not the only command", () => {
      assert.deepEqual(Array.from(extractNpxFromScripts({ test: "tsc && npx jest --coverage" })), [
        {
          binaryName: "jest",
          flags: [],
          scriptName: "test"
        }
      ]);
    });

    it("should extract the flags", () => {
      assert.deepEqual(Array.from(extractNpxFromScripts({ test: "npx --no jest" })), [
        {
          binaryName: "jest",
          flags: ["--no"],
          scriptName: "test"
        }
      ]);
    });

    it("should be able to extract multiple flags", () => {
      assert.deepEqual(Array.from(extractNpxFromScripts({ test: "npx --no --quiet jest" })), [
        {
          binaryName: "jest",
          flags: ["--no", "--quiet"],
          scriptName: "test"
        }
      ]);

      assert.deepEqual(Array.from(extractNpxFromScripts({ test: "npx --no  --quiet jest" })), [
        {
          binaryName: "jest",
          flags: ["--no", "--quiet"],
          scriptName: "test"
        }
      ]);
    });

    it("should not match unrelated command", () => {
      assert.deepEqual(Array.from(extractNpxFromScripts({ solve: "rnpx solve" })), []);
    });

    it("should extract remove the version from the binary name when there is one", () => {
      assert.deepEqual(
        Array.from(extractNpxFromScripts({ release: "npx -y -p @changesets/cli@3.0.1 -c 'changeset version'" })),
        [
          {
            binaryName: "@changesets/cli",
            flags: ["-y", "-p"],
            scriptName: "release"
          }
        ]
      );
    });

    it("should be able to match multiple npx commands in one script", () => {
      assert.deepEqual(
        Array.from(extractNpxFromScripts({ release: "npx a && npx b" })),
        [
          {
            binaryName: "a",
            flags: [],
            scriptName: "release"
          },
          {
            binaryName: "b",
            flags: [],
            scriptName: "release"
          }
        ]
      );
    });
  });

  describe("npx command extraction from scripts", () => {
    it("should extract nothing when there is no scripts", () => {
      assert.deepEqual(Array.from(extractNpxFromScripts(undefined)), []);
      assert.deepEqual(Array.from(extractNpxFromScripts({})), []);
    });

    it("should extract the npx command from the scripts when there is one", () => {
      assert.deepEqual(Array.from(extractNpxFromScripts({
        test: "npx --yes=false jest",
        exec: "npx my-internal-tool",
        start: "npm run start"
      })), [
        { binaryName: "jest", flags: ["--yes=false"], scriptName: "test" },
        { binaryName: "my-internal-tool", flags: [], scriptName: "exec" }
      ]);
    });
  });
});
