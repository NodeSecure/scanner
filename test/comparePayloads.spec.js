// Require Node.js Dependencies
import { it } from "node:test";
import assert from "node:assert";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

// Require Internal Dependencies
import { comparePayloads } from "../src/comparePayloads.js";

// CONSTANTS
const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE_PATH = join(__dirname, "fixtures", "scannerPayloads");
const payload = JSON.parse(readFileSync(join(FIXTURE_PATH, "/payload.json"), "utf8"));

it("should throw an error if compared payloads are not from the same package", () => {
  assert.throws(
    () => compareTo("otherRootDependency"),
    { message: "You can't compare different package payloads 'is-wsl' and 'is-not-wsl'" }
  );
});

it("should detect deep dependencies diff", () => {
  const { dependencies: { compared, added, removed } } = compareTo("deeplyUpdatedPayload");

  // Global comparison of dependencies
  assert.strictEqual(added.size, 1);
  assert.ok(added.has("baz"));

  assert.strictEqual(removed.size, 1);
  assert.ok(removed.has("bar"));

  assert.strictEqual(compared.size, 1);
  assert.ok(compared.has("foo"));

  // Updated dependency deep comparison
  const foo = compared.get("foo");
  assert.ok(foo.publishers.added.some((m) => m.name === "hugo"));
  assert.ok(foo.publishers.removed.some((m) => m.name === "jack"));

  assert.ok(foo.maintainers.added.some((m) => m.name === "hugo"));
  assert.ok(foo.maintainers.removed.some((m) => m.name === "jack"));

  assert.ok(foo.versions.added.has("3.0.2"));
  assert.strictEqual(foo.versions.added.size, 1);

  assert.ok(foo.versions.removed.has("3.0.1"));
  assert.strictEqual(foo.versions.removed.size, 1);

  assert.ok(foo.versions.compared.has("3.0.0"));
  assert.strictEqual(foo.versions.compared.size, 1);

  const comparedVersion = foo.versions.compared.get("3.0.0");
  assert.ok(comparedVersion.usedBy.added.has("foo"));
  assert.strictEqual(comparedVersion.usedBy.added.size, 1);

  assert.ok(comparedVersion.usedBy.removed.has("baz"));
  assert.strictEqual(comparedVersion.usedBy.removed.size, 1);
});

const payloads = {};
function compareTo(name) {
  if (!payloads[name]) {
    payloads[name] = JSON.parse(readFileSync(join(FIXTURE_PATH, `/${name}.json`), "utf8"));
  }

  return comparePayloads(
    payload,
    payloads[name]
  );
}


