// Import Node.js Dependencies
import assert from "node:assert";
import { test } from "node:test";

// Import Internal Dependencies
import { getSemVerWarning } from "../src/warnings.ts";

// CONSTANTS
const kDefaultWarning = {
  kind: "zero-semver",
  file: "package.json",
  location: null,
  i18n: "sast_warnings.zero_semver",
  severity: "Information",
  source: "Scanner",
  experimental: false
};

test("getSemVerWarning should return a warning for any SemVer starting with 0.x", () => {
  assert.deepEqual(getSemVerWarning("0"), {
    value: "0", ...kDefaultWarning
  });

  assert.deepEqual(getSemVerWarning("0.0"), {
    value: "0.0", ...kDefaultWarning
  });

  assert.deepEqual(getSemVerWarning("0.0.0"), {
    value: "0.0.0", ...kDefaultWarning
  });
});
