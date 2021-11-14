// Import Node.js Dependencies
import fs from "fs/promises";
import path from "path";

// Import Third-party Dependencies
import test from "tape";
import sinon from "sinon";

// Import Internal Dependencies
import { readManifest } from "../../src/tarball.js";

test("readManifest with a fake empty package.json (so all default values must be returned)", async(tape) => {
  const readFile = sinon.stub(fs, "readFile").resolves(JSON.stringify({}));
  tape.teardown(() => readFile.restore());

  const manifestResult = await readManifest(process.cwd());

  tape.deepEqual(manifestResult.packageDeps, []);
  tape.deepEqual(manifestResult.packageDevDeps, []);
  tape.false(manifestResult.packageGyp);
  tape.false(manifestResult.hasScript);
  tape.deepEqual(manifestResult.author, {});
  tape.strictEqual(manifestResult.description, "");
  tape.true(readFile.calledWith(path.join(process.cwd(), "package.json"), "utf-8"));
  tape.true(readFile.calledOnce);

  tape.end();
});

test("readManifest with expected data", async(tape) => {
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
    gypfile: true
  }));
  tape.teardown(() => readFile.restore());

  const manifestResult = await readManifest(process.cwd());

  tape.deepEqual(manifestResult.packageDeps, ["@slimio/is"]);
  tape.deepEqual(manifestResult.packageDevDeps, ["mocha"]);
  tape.true(manifestResult.packageGyp);

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
