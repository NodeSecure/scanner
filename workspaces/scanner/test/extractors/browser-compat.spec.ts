// Import Node.js Dependencies
import assert from "node:assert";
import { readdirSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

// Import Third-party Dependencies
import * as esbuild from "esbuild";

// CONSTANTS
const kExtractorsDir = path.join(import.meta.dirname, "..", "..", "src", "extractors");
const kProbesDir = path.join(kExtractorsDir, "probes");
const kEntryPoints = [
  path.join(kExtractorsDir, "index.ts"),
  path.join(kExtractorsDir, "payload.ts"),
  ...readdirSync(kProbesDir)
    .filter((file) => file.endsWith(".ts"))
    .map((file) => path.join(kProbesDir, file))
];

describe("Extractors browser compatibility", () => {
  for (const entryPoint of kEntryPoints) {
    const entryName = path.relative(kExtractorsDir, entryPoint);

    it(`should bundle '${entryName}' for a browser target with no Node.js builtins`, async() => {
      try {
        await esbuild.build({
          entryPoints: [entryPoint],
          bundle: true,
          write: false,
          platform: "browser",
          external: [],
          logLevel: "silent"
        });
      }
      catch (error: any) {
        const reasons = (error.errors ?? [])
          .map((buildError: esbuild.Message) => buildError.text)
          .join("\n");

        assert.fail(
          `'${entryName}' is not browser-compatible (it cannot be bundled for a "browser" platform):\n${reasons || error.message}`
        );
      }
    });
  }
});
