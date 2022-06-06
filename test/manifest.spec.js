// Import Node.js Dependencies
import fs from "fs/promises";
import path from "path";

// Import Third-party Dependencies
import test from "tape";
import sinon from "sinon";

// Import Internal Dependencies
import * as manifest from "../src/manifest.js";

test("manifest.readAnalyze with a fake empty package.json (so all default values must be returned)", async(tape) => {
  const readFile = sinon.stub(fs, "readFile").resolves(JSON.stringify({}));
  tape.teardown(() => readFile.restore());

  const manifestResult = await manifest.readAnalyze(process.cwd());

  tape.deepEqual(manifestResult.packageDeps, []);
  tape.deepEqual(manifestResult.packageDevDeps, []);
  tape.false(manifestResult.hasNativeElements);
  tape.false(manifestResult.hasScript);
  tape.deepEqual(manifestResult.author, {});
  tape.strictEqual(manifestResult.description, "");
  tape.deepEqual(manifestResult.nodejs, { imports: {} });
  tape.true(readFile.calledWith(path.join(process.cwd(), "package.json"), "utf-8"));
  tape.true(readFile.calledOnce);

  tape.end();
});

test("manifest.readAnalyze with a fake but consistent data", async(tape) => {
  const readFile = sinon.stub(fs, "readFile").resolves(JSON.stringify({
    description: "foobar",
    author: "GENTILHOMME Thomas <gentilhomme.thomas@gmail.com>",
    scripts: {
      preinstall: "npx foobar"
    },
    dependencies: {
      "@slimio/is": "^1.0.0"
    },
    devDependencies: {
      mocha: ">=2.5.0"
    },
    imports: {
      "#dep": {
        node: "kleur"
      }
    },
    gypfile: true
  }));
  tape.teardown(() => readFile.restore());

  const manifestResult = await manifest.readAnalyze(process.cwd());

  tape.deepEqual(manifestResult.packageDeps, ["@slimio/is"]);
  tape.deepEqual(manifestResult.packageDevDeps, ["mocha"]);
  tape.deepEqual(manifestResult.nodejs.imports, {
    "#dep": {
      node: "kleur"
    }
  });
  tape.true(manifestResult.hasNativeElements);
  tape.true(manifestResult.hasScript);
  tape.deepEqual(manifestResult.author, {
    name: "GENTILHOMME Thomas",
    email: "gentilhomme.thomas@gmail.com"
  });
  tape.strictEqual(manifestResult.description, "foobar");

  tape.true(readFile.calledWith(path.join(process.cwd(), "package.json"), "utf-8"));
  tape.true(readFile.calledOnce);

  tape.end();
});

test("manifest.readAnalyze should return hasNativeElements: true because of the dependencies", async(tape) => {
  const readFile = sinon.stub(fs, "readFile").resolves(JSON.stringify({
    dependencies: {
      "node-addon-api": "^1.0.0"
    },
    devDependencies: {
      "node-gyp": "8.0.0"
    }
  }));
  tape.teardown(() => readFile.restore());

  const manifestResult = await manifest.readAnalyze(process.cwd());
  tape.true(manifestResult.hasNativeElements);

  tape.end();
});
