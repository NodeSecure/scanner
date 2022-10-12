// Require Node.js Dependencies
import { join, dirname } from "path";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";

// Third party Dependencies
import test from "tape";
import snapshot from "snap-shot-core";

// Require Internal Dependencies
import { compare } from "../index.js";

// CONSTANTS
const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE_PATH = join("fixtures", "depWalker");

// JSON PAYLOADS
const is = readFileSync(
  new URL(join(FIXTURE_PATH, "slimio.is.json"), import.meta.url)
);
const isv2 = readFileSync(
  new URL(join(FIXTURE_PATH, "slimio.is.v2.json"), import.meta.url)
);

test.onFinish(snapshot.restore);

test("Compare two @slimio/is versions", async(tape) => {
  tape.deepEqual(
    compare(is, isv2),
    [
      "engines",
      "license",
      "version"
    ]);

  tape.end();
});
