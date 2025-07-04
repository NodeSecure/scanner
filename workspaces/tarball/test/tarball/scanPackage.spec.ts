// Import Node.js Dependencies
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import { scanPackage } from "../../src/index.js";
import { getEmptyPackageWarning } from "../../src/warnings.js";

// CONSTANTS
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const kFixturePath = path.join(__dirname, "..", "fixtures", "scanPackage");

test("scanPackage (caseone)", async() => {
  const result = await scanPackage(
    path.join(kFixturePath, "caseone")
  );
  result.files.extensions.sort();

  assert.deepEqual(result.files, {
    list: [
      ".gitignore",
      "foobar.txt",
      "index.js",
      "package.json",
      "src\\deps.js",
      "src\\other.min.js"
    ].map((location) => location.replace(/\\/g, path.sep)),
    extensions: [
      "",
      ".txt",
      ".js",
      ".json"
    ].sort(),
    minified: [
      "src\\other.min.js"
    ].map((location) => location.replace(/\\/g, path.sep))
  });

  assert.ok(typeof result.directorySize === "number", "directorySize should be a number");
  assert.ok(result.directorySize > 0, "directorySize has a size different of zero");

  assert.deepEqual(result.uniqueLicenseIds, ["MIT"], "Unique license ID should only contain MIT");
  assert.deepEqual(result.licenses, [
    {
      fileName: "package.json",
      licenses: {
        MIT: "https://spdx.org/licenses/MIT.html#licenseText"
      },
      spdx: {
        osi: true,
        fsf: true,
        fsfAndOsi: true,
        includesDeprecated: false
      }
    }
  ]);

  assert.ok(result.ast.warnings.length === 0);
  assert.deepEqual(
    Object.keys(result.ast.dependencies).sort(),
    [
      "index.js",
      "src\\deps.js",
      "src\\other.min.js"
    ]
      .map((location) => location.replace(/\\/g, path.sep))
      .sort()
  );
  assert.deepEqual(Object.keys(result.ast.dependencies["index.js"]), [
    "./src/deps.js",
    "fs",
    "kleur"
  ]);
  assert.ok(result.ast.dependencies["index.js"].fs.inTry);
});

test("scanPackage should detect empty packages (only package.json)", async() => {
  const result = await scanPackage(
    path.join(kFixturePath, "emptypackage")
  );

  const emptyPackageWarning = getEmptyPackageWarning();
  const hasEmptyPackageWarning = result.ast.warnings.some(
    (warning) => (warning.kind === emptyPackageWarning.kind)
  );
  assert.ok(hasEmptyPackageWarning, "Should contain empty-package warning");
  assert.strictEqual(result.files.list.length, 1, "Should only have one file (package.json)");
  assert.strictEqual(result.files.list[0], "package.json", "The only file should be package.json");
});
