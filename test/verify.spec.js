// Import Node.js Dependencies
import { fileURLToPath } from "url";
import path from "path";

// Import Third-party Dependencies
import test from "tape";
import snapshot from "snap-shot-core";
import Result from "folktale/result/index.js";

// Import Internal Dependencies
import { verify } from "../index.js";

test.onFinish(snapshot.restore);

function cleanupAstDependenciesSnapshot(dependencies) {
  const cleaned = {};

  for (const [file, value] of Object.entries(dependencies)) {
    cleaned[file.replaceAll("\\", path.sep)] = value;
  }

  return cleaned;
}

test("verify 'express' package", async(tape) => {
  const data = await verify("express@4.17.0");
  data.files.extensions.sort();

  tape.deepEqual(data.files, {
    list: [
      "History.md",
      "LICENSE",
      "Readme.md",
      "index.js",
      "lib\\application.js",
      "lib\\express.js",
      "lib\\middleware\\init.js",
      "lib\\middleware\\query.js",
      "lib\\request.js",
      "lib\\response.js",
      "lib\\router\\index.js",
      "lib\\router\\layer.js",
      "lib\\router\\route.js",
      "lib\\utils.js",
      "lib\\view.js",
      "package.json"
    ].map((location) => location.replaceAll("\\", path.sep)),
    extensions: [".md", ".js", ".json"].sort(),
    minified: []
  });
  tape.true(data.directorySize > 0);

  // licenses
  tape.deepEqual(data.uniqueLicenseIds, ["MIT"]);
  tape.deepEqual(data.licenses, [
    {
      uniqueLicenseIds: ["MIT"],
      spdxLicenseLinks: ["https://spdx.org/licenses/MIT.html#licenseText"],
      spdx: {
        osi: true,
        fsf: true,
        fsfAndOsi: true,
        includesDeprecated: false
      },
      from: "package.json"
    },
    {
      uniqueLicenseIds: ["MIT"],
      spdxLicenseLinks: ["https://spdx.org/licenses/MIT.html#licenseText"],
      spdx: {
        osi: true,
        fsf: true,
        fsfAndOsi: true,
        includesDeprecated: false
      },
      from: "LICENSE"
    }
  ]);

  tape.true(data.ast.warnings.length === 2);
  const warningName = data.ast.warnings.map((row) => row.kind);
  tape.deepEqual(warningName, ["unsafe-import"]);

  snapshot.core({
    what: data.ast.dependencies,
    file: fileURLToPath(import.meta.url),
    specName: "verify express@4.17.0",
    compare: (options) => {
      const cleanSnapshot = cleanupAstDependenciesSnapshot(JSON.parse(options.expected));
      const expected = JSON.stringify(cleanSnapshot);
      const value = JSON.stringify(options.value);

      if (expected === value) {
        return Result.Ok();
      }

      return Result.Error(`${expected} !== ${value}`);
    }
  });

  tape.end();
});
