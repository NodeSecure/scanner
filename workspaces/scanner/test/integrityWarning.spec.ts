// Import Node.js Dependencies
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { from } from "../src/index.js";

test("expect one warning from 'darcyclarke-manifest-pkg' with an integrity issue", async() => {
  const result = await from("darcyclarke-manifest-pkg", {
    maxDepth: 2
  });

  assert.equal(result.warnings.length, 1);

  const warning = result.warnings[0];
  assert.equal(warning.type, "integrity-mismatch");
  assert.match(warning.message, /manifest & tarball integrity doesn't match/g);
});
