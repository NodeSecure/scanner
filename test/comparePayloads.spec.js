// Require Node.js Dependencies
import { it } from "node:test";
import assert from "node:assert";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

// Require Internal Dependencies
import { comparePayloads } from "../index.js";

// CONSTANTS
const __dirname = dirname(fileURLToPath(import.meta.url));
const kFixturePath = join(__dirname, "fixtures", "scannerPayloads");
const kPayload = JSON.parse(readFileSync(join(kFixturePath, "/payload.json"), "utf8"));

it("should throw an error if compared payloads have the same id", () => {
  assert.throws(
    () => compareTo("sameIdPayload"),
    { message: `You try to compare two payloads with the same id '${kPayload.id}'` }
  );
});

it("should throw an error if compared payloads are not from the same package", () => {
  assert.throws(
    () => compareTo("otherRootDependency"),
    { message: "You can't compare different package payloads 'is-wsl' and 'is-not-wsl'" }
  );
});

it("should detect warnings diff", () => {
  const { warnings: { added, removed }, dependencies: { compared } } = compareTo("warningChangedPayload");

  assert.strictEqual(added.length, 1);
  assert.deepStrictEqual(added[0], "encoded-literal");

  assert.strictEqual(removed.length, 1);
  assert.deepStrictEqual(removed[0], "unsafe-regex");

  const deepWarnings = compared.get("foo").versions.compared.get("2.0.0").warnings;
  assert.strictEqual(deepWarnings.added.length, 1);
  assert.deepStrictEqual(deepWarnings.added[0], {
    kind: "unsafe-import",
    location: [[4, 26], [4, 65]],
    source: "JS-X-Ray",
    i18n: "sast_warnings.unsafe_import",
    severity: "Warning",
    file: "examples/asyncawait.js"
  });

  assert.strictEqual(deepWarnings.removed.length, 1);
  assert.deepStrictEqual(deepWarnings.removed[0], {
    kind: "unsafe-regex",
    location: [[3, 16], [3, 55]],
    source: "JS-X-Ray",
    i18n: "sast_warnings.unsafe_import",
    severity: "Warning",
    file: "examples/asyncawait.js"
  });
});

it("should detect flagged authors diff", () => {
  const { flaggedAuthors: { added, removed } } = compareTo("flaggedAuthorsChanged");

  assert.strictEqual(added.length, 1);
  assert.deepStrictEqual(added[0], {
    name: "hugo",
    email: "hugo@gmail.com"
  });

  assert.strictEqual(removed.length, 1);
  assert.deepStrictEqual(removed[0], {
    name: "jack",
    email: "jack@gmail.com"
  });
});

it("should detect scanner version diff", () => {
  const { scannerVersion: { prev, now } } = compareTo("scannerVersionChanged");

  assert.strictEqual(prev, "1.0.0");
  assert.strictEqual(now, "1.0.1");
});

it("should detect vulnerability strategy version diff", () => {
  const { vulnerabilityStrategy: { prev, now } } = compareTo("vulnerabilityStrategyChanged");

  assert.strictEqual(prev, "npm");
  assert.strictEqual(now, "snyk");
});


it("should detect dependencies diff", () => {
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
  assert.ok(foo.vulnerabilities.added.some((v) => v.id === "baz"));
  assert.ok(foo.vulnerabilities.removed.some((v) => v.id === "bar"));

  assert.ok(foo.publishers.added.some((m) => m.name === "hugo"));
  assert.ok(foo.publishers.removed.some((m) => m.name === "jack"));

  assert.ok(foo.maintainers.added.some((m) => m.name === "hugo"));
  assert.ok(foo.maintainers.removed.some((m) => m.name === "jack"));

  assert.ok(foo.versions.added.has("3.0.2"));
  assert.strictEqual(foo.versions.added.size, 1);

  assert.ok(foo.versions.removed.has("3.0.1"));
  assert.strictEqual(foo.versions.removed.size, 1);

  assert.ok(foo.versions.compared.has("3.0.0"));
  assert.ok(foo.versions.compared.has("2.0.0"));
  assert.strictEqual(foo.versions.compared.size, 2);
});

it("should detect version diff", () => {
  const { dependencies: { compared } } = compareTo("deeplyUpdatedPayload");

  const comparedVersion2 = compared.get("foo").versions.compared.get("2.0.0");
  assert.ok(comparedVersion2.id.prev === "abc");
  assert.ok(comparedVersion2.id.now === "bcd");

  assert.strictEqual(comparedVersion2.size.prev, "1");
  assert.strictEqual(comparedVersion2.size.now, "2");

  const usedBy = comparedVersion2.usedBy;
  assert.ok(usedBy.added.has("baz"));
  assert.strictEqual(usedBy.added.size, 1);

  assert.ok(usedBy.removed.has("bar"));
  assert.strictEqual(usedBy.removed.size, 1);

  assert.strictEqual(usedBy.compared.get("foo").prev, "1.0.0");
  assert.strictEqual(usedBy.compared.get("foo").now, "1.0.1");

  assert.ok(comparedVersion2.devDependency.prev === false);
  assert.ok(comparedVersion2.devDependency.now === true);

  assert.ok(comparedVersion2.existOnRemoteRegistry.prev === false);
  assert.ok(comparedVersion2.existOnRemoteRegistry.now === true);

  assert.ok(comparedVersion2.description.prev === "foo");
  assert.ok(comparedVersion2.description.now === "bar");

  assert.equal(comparedVersion2.author.prev.name, "Sindre Sorhus");
  assert.deepStrictEqual(comparedVersion2.author.now, {
    name: "Franck Sorhus",
    email: "franck@gmail.com",
    url: "https://franck.com"
  });

  // repository: diff on type only
  assert.deepStrictEqual(comparedVersion2.repository.prev, {
    type: "svn",
    url: "https://github.com/NodeSecure/js-x-ray"
  });

  assert.deepStrictEqual(comparedVersion2.repository.now, {
    type: "git",
    url: "https://github.com/NodeSecure/js-x-ray"
  });

  assert.deepStrictEqual(comparedVersion2.links.prev, {
    npm: "https://www.npmjs.com/package/example-package",
    homepage: "https://example-package.com",
    repository: "https://github.com/example-package/example-repo"
  });

  assert.deepStrictEqual(comparedVersion2.links.now, {
    npm: "https://www.npmjs.com/package/example-package2",
    homepage: "https://example-package2.com",
    repository: "https://github.com/example-package/example-repo2"
  });

  const comparedVersion3 = compared.get("foo").versions.compared.get("3.0.0");
  assert.strictEqual(comparedVersion3.devDependency, undefined);
  assert.strictEqual(comparedVersion3.author, undefined);

  // repository: diff on url only
  assert.deepStrictEqual(comparedVersion3.repository.prev, {
    type: "git",
    url: "https://github.com/NodeSecure/js-x-ray"
  });

  assert.deepStrictEqual(comparedVersion3.repository.now, {
    type: "git",
    url: "https://github.com/NodeSecure/js-x-ray2"
  });
});

it("should detect compared version composition diff", () => {
  const { dependencies: { compared } } = compareTo("deeplyUpdatedPayload");

  const comparedVersion2 = compared.get("foo").versions.compared.get("2.0.0");

  const composition = comparedVersion2.composition;
  assert.strictEqual(composition.minified.added.length, 1);
  assert.strictEqual(composition.minified.added[0], "baz.min.js");

  assert.strictEqual(composition.minified.removed.length, 1);
  assert.strictEqual(composition.minified.removed[0], "bar.min.js");

  assert.strictEqual(composition.required_thirdparty.added.length, 1);
  assert.strictEqual(composition.required_thirdparty.added[0], "baz");

  assert.strictEqual(composition.required_thirdparty.removed.length, 1);
  assert.strictEqual(composition.required_thirdparty.removed[0], "bar");

  assert.strictEqual(composition.required_nodejs.added.length, 1);
  assert.strictEqual(composition.required_nodejs.added[0], "baz");

  assert.strictEqual(composition.required_nodejs.removed.length, 1);
  assert.strictEqual(composition.required_nodejs.removed[0], "bar");

  assert.strictEqual(composition.unused.added.length, 1);
  assert.strictEqual(composition.unused.added[0], "baz");

  assert.strictEqual(composition.unused.removed.length, 1);
  assert.strictEqual(composition.unused.removed[0], "bar");

  assert.strictEqual(composition.missing.added.length, 1);
  assert.strictEqual(composition.missing.added[0], "baz");

  assert.strictEqual(composition.missing.removed.length, 1);
  assert.strictEqual(composition.missing.removed[0], "bar");
});

it("should detect license IDs diff", () => {
  const { dependencies: { compared } } = compareTo("deeplyUpdatedPayload");
  const { licenseIds } = compared.get("foo").versions.compared.get("2.0.0");

  assert.strictEqual(licenseIds.added.length, 1);
  assert.strictEqual(licenseIds.added[0], "BSD-3-Clause");

  assert.strictEqual(licenseIds.removed.length, 1);
  assert.strictEqual(licenseIds.removed[0], "GPL-3.0");
});

it("should detect flags diff", () => {
  const { dependencies: { compared } } = compareTo("deeplyUpdatedPayload");
  const { flags } = compared.get("foo").versions.compared.get("2.0.0");

  assert.strictEqual(flags.added.length, 1);
  assert.strictEqual(flags.added[0], "🌲");

  assert.strictEqual(flags.removed.length, 1);
  assert.strictEqual(flags.removed[0], "💎");
});

it("should detect engines diff", () => {
  const { dependencies: { compared } } = compareTo("deeplyUpdatedPayload");
  const { engines } = compared.get("foo").versions.compared.get("2.0.0");

  assert.strictEqual(engines.added.size, 1);
  assert.ok(engines.added.has("node4"));

  assert.strictEqual(engines.removed.size, 1);
  assert.ok(engines.removed.has("node"));

  assert.strictEqual(engines.compared.size, 2);
  assert.ok(engines.compared.has("node2"));
  assert.ok(engines.compared.has("node3"));
  assert.strictEqual(engines.compared.get("node2").prev, "^12.20.0 || ^14.13.1 || >=16.0.0");
  assert.strictEqual(engines.compared.get("node2").now, "^14.20.0 || ^16.13.1 || >=18.0.0");
});

it("should detect scripts diff", () => {
  const { dependencies: { compared } } = compareTo("deeplyUpdatedPayload");
  const { scripts } = compared.get("foo").versions.compared.get("2.0.0");

  assert.strictEqual(scripts.added.size, 1);
  assert.ok(scripts.added.has("lint"));

  assert.strictEqual(scripts.removed.size, 1);
  assert.ok(scripts.removed.has("ci"));

  assert.strictEqual(scripts.compared.size, 2);
  assert.ok(scripts.compared.has("test"));
  assert.strictEqual(scripts.compared.get("test"), undefined);
  assert.ok(scripts.compared.has("standard"));
  assert.strictEqual(scripts.compared.get("standard").prev, "npx standard");
  assert.strictEqual(scripts.compared.get("standard").now, "npx standard --fix");
});

const payloads = {};
function compareTo(name) {
  if (!payloads[name]) {
    payloads[name] = JSON.parse(readFileSync(join(kFixturePath, `/${name}.json`), "utf8"));
  }

  return comparePayloads(
    kPayload,
    payloads[name]
  );
}


