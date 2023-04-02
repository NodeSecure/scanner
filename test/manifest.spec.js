// Import Node.js Dependencies
import fs from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import assert from "node:assert";

// Import Third-party Dependencies
import sinon from "sinon";

// Import Internal Dependencies
import * as manifest from "../src/manifest.js";

test("manifest.readAnalyze with a fake empty package.json (so all default values must be returned)", async() => {
  const readFile = sinon.stub(fs, "readFile").resolves(JSON.stringify({}));

  const manifestResult = await manifest.readAnalyze(process.cwd());

  assert.deepEqual(manifestResult.packageDeps, []);
  assert.deepEqual(manifestResult.packageDevDeps, []);
  assert.ok(!manifestResult.hasNativeElements);
  assert.ok(!manifestResult.hasScript);
  assert.deepEqual(manifestResult.author, {});
  assert.strictEqual(manifestResult.description, "");
  assert.deepEqual(manifestResult.nodejs, { imports: {} });
  assert.ok(readFile.calledWith(path.join(process.cwd(), "package.json"), "utf-8"));
  assert.ok(readFile.calledOnce);

  readFile.restore();
});

test("manifest.readAnalyze with a fake but consistent data", async() => {
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

  const manifestResult = await manifest.readAnalyze(process.cwd());

  assert.deepEqual(manifestResult.packageDeps, ["@slimio/is"]);
  assert.deepEqual(manifestResult.packageDevDeps, ["mocha"]);
  assert.deepEqual(manifestResult.nodejs.imports, {
    "#dep": {
      node: "kleur"
    }
  });
  assert.deepEqual(manifestResult.scripts, {
    preinstall: "npx foobar"
  });
  assert.deepEqual(manifestResult.engines, {});
  assert.deepEqual(manifestResult.repository, {});
  assert.ok(manifestResult.hasNativeElements);
  assert.ok(manifestResult.hasScript);
  assert.deepEqual(manifestResult.author, {
    name: "GENTILHOMME Thomas",
    email: "gentilhomme.thomas@gmail.com"
  });
  assert.strictEqual(manifestResult.description, "foobar");

  assert.ok(readFile.calledWith(path.join(process.cwd(), "package.json"), "utf-8"));
  assert.ok(readFile.calledOnce);

  readFile.restore();
});

test("manifest.readAnalyze should return hasNativeElements: true because of the dependencies", async() => {
  const readFile = sinon.stub(fs, "readFile").resolves(JSON.stringify({
    dependencies: {
      "node-addon-api": "^1.0.0"
    },
    devDependencies: {
      "node-gyp": "8.0.0"
    }
  }));

  const manifestResult = await manifest.readAnalyze(process.cwd());
  assert.ok(manifestResult.hasNativeElements);

  readFile.restore();
});
