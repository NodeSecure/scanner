// Require Node.js Dependencies
import { test } from "node:test";
import assert from "node:assert";

// Require Internal Dependencies
import { from } from "../index.js";

test("expect one warning from 'darcyclarke-manifest-pkg' with an integrity issue", async() => {
  const result = await from("darcyclarke-manifest-pkg", {
    verbose: false,
    maxDepth: 2
  });

  assert.equal(result.warnings.length, 1);
  assert.match(result.warnings[0], /manifest & tarball integrity doesn't match/g);
});
