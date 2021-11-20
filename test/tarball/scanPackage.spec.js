// Require Node.js Dependencies
import path from "path";
import { fileURLToPath } from "url";

// Third party Dependencies
import test from "tape";

// Require Internal Dependencies
import { scanPackage } from "../../src/tarball.js";

// CONSTANTS
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_PATH = path.join(__dirname, "..", "fixtures", "scanPackage");

test("scanPackage (caseone)", async(tape) => {
  const result = await scanPackage(path.join(FIXTURE_PATH, "caseone"));

  tape.deepEqual(result.files, {
    list: [
      ".gitignore",
      "foobar.txt",
      "index.js",
      "package.json",
      "src\\deps.js",
      "src\\other.min.js"
    ],
    extensions: [
      ".txt",
      ".js",
      ".json"
    ],
    minified: [
      "src\\other.min.js"
    ]
  });

  tape.true(typeof result.directorySize === "number", "directorySize should be a number");
  tape.true(result.directorySize > 0, "directorySize has a size different of zero");

  tape.deepEqual(result.uniqueLicenseIds, ["MIT"], "Unique license ID should only contain MIT");
  tape.deepEqual(result.licenses, [
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

  tape.true(result.ast.warnings.length === 0);
  tape.deepEqual(Object.keys(result.ast.dependencies), [
    "index.js",
    "src\\deps.js",
    "src\\other.min.js"
  ]);
  tape.deepEqual(Object.keys(result.ast.dependencies["index.js"]), [
    "./src/deps.js",
    "fs",
    "kleur"
  ]);
  tape.true(result.ast.dependencies["index.js"].fs.inTry);

  tape.end();
});
