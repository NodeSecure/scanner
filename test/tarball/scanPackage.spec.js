// Require Node.js Dependencies
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import assert from "node:assert";

// Require Internal Dependencies
import { scanPackage } from "../../src/tarball.js";

// CONSTANTS
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_PATH = path.join(__dirname, "..", "fixtures", "scanPackage");

test("scanPackage (caseone)", async() => {
  const result = await scanPackage(path.join(FIXTURE_PATH, "caseone"));
  result.files.extensions.sort();

  assert.deepEqual(result.files, {
    list: [
      ".gitignore",
      "foobar.txt",
      "index.js",
      "package.json",
      "src\\deps.js",
      "src\\other.min.js"
    ].map((location) => location.replaceAll("\\", path.sep)),
    extensions: [
      ".txt",
      ".js",
      ".json"
    ].sort(),
    minified: [
      "src\\other.min.js"
    ].map((location) => location.replaceAll("\\", path.sep))
  });

  assert.ok(typeof result.directorySize === "number", "directorySize should be a number");
  assert.ok(result.directorySize > 0, "directorySize has a size different of zero");

  assert.deepEqual(result.uniqueLicenseIds, ["MIT"], "Unique license ID should only contain MIT");
  assert.deepEqual(result.licenses, [
    {
      uniqueLicenseIds: [
        "MIT"
      ],
      spdxLicenseLinks: [
        "https://spdx.org/licenses/MIT.html#licenseText"
      ],
      spdx: {
        osi: true,
        fsf: true,
        fsfAndOsi: true,
        includesDeprecated: false
      },
      from: "package.json"
    }
  ]);

  assert.ok(result.ast.warnings.length === 0);
  assert.deepEqual(Object.keys(result.ast.dependencies), [
    "index.js",
    "src\\deps.js",
    "src\\other.min.js"
  ].map((location) => location.replaceAll("\\", path.sep)));
  assert.deepEqual(Object.keys(result.ast.dependencies["index.js"]), [
    "./src/deps.js",
    "fs",
    "kleur"
  ]);
  assert.ok(result.ast.dependencies["index.js"].fs.inTry);
});
