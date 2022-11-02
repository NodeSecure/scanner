// Require Node.js Dependencies
import { join, dirname } from "path";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";

// Third party Dependencies
import { setStrategy, strategies } from "@nodesecure/vuln";
import test from "tape";
import snapshot from "snap-shot-core";

// Require Internal Dependencies
import { compare } from "../index.js";

// CONSTANTS
const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE_PATH = join("fixtures", "compare");

// JSON PAYLOADS
const nsecureNew = readFileSync(
  new URL(join(FIXTURE_PATH, "nodesecure-scanner.v2.json"), import.meta.url)
);
const nsecureOld = readFileSync(
  new URL(join(FIXTURE_PATH, "nodesecure-scanner.json"), import.meta.url)
);

function replacer(key, value) {
  if (value instanceof Map) {
    return Object.fromEntries(value);
  }

  return value;
}

test.onFinish(snapshot.restore);

test("Compare two @nodesecure/scanner versions", async(tape) => {
  await setStrategy(strategies.NPM_AUDIT);

  const comparison = compare(nsecureNew, nsecureOld);
  const comparisonAsJSON = JSON.parse(JSON.stringify(comparison, replacer, 2));

  snapshot.core({
    what: comparisonAsJSON,
    file: fileURLToPath(import.meta.url),
    specName: "compare @nodesecure/scanner"
  });

  tape.end();
});
