// Require Node.js Dependencies
import path from "path";
import { fileURLToPath } from "url";

// Third party Dependencies
import test from "tape";

// Require Internal Dependencies
import { scanJavascriptFile } from "../../src/tarball.js";

// CONSTANTS
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_PATH = path.join(__dirname, "..", "fixtures", "scanJavascriptFile");

test("scanJavascriptFile (fixture one.js)", async(tape) => {
  const result = await scanJavascriptFile(FIXTURE_PATH, "one.js", "yolo");
  tape.deepEqual(result, {
    file: "one.js",
    warnings: [],
    isMinified: false,
    tryDependencies: [],
    dependencies: ["http", "mocha"],
    filesDependencies: ["src\\foo.js", "home\\marco.js"]
  });

  tape.end();
});

test("scanJavascriptFile (fixture two.min.js)", async(tape) => {
  const result = await scanJavascriptFile(FIXTURE_PATH, "two.min.js", "yolo");
  tape.deepEqual(result, {
    file: "two.min.js",
    warnings: [],
    isMinified: true,
    tryDependencies: ["http"],
    dependencies: ["http", "fs"],
    filesDependencies: []
  });

  tape.end();
});

test("scanJavascriptFile (fixture onelineStmt.min.js)", async(tape) => {
  const result = await scanJavascriptFile(FIXTURE_PATH, "onelineStmt.min.js", "yolo");
  tape.deepEqual(result, {
    file: "onelineStmt.min.js",
    warnings: [],
    isMinified: false,
    tryDependencies: [],
    dependencies: [],
    filesDependencies: ["foobar.js"]
  });

  tape.end();
});

test("scanJavascriptFile (fixture parsingError.js)", async(tape) => {
  const result = await scanJavascriptFile(FIXTURE_PATH, "parsingError.js", "yolo");

  tape.deepEqual(result, {
    file: "parsingError.js",
    warnings: [
      {
        kind: "parsing-error",
        value: "[1:5]: Unexpected token: ';'",
        location: [[0, 0], [0, 0]],
        file: "parsingError.js"
      }
    ],
    isMinified: false,
    tryDependencies: [],
    dependencies: [],
    filesDependencies: []
  });

  tape.end();
});
