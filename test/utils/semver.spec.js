// Require Node.js Dependencies
import { test } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

// Import Third-party Dependencies
import pacote from "pacote";
import sinon from "sinon";

// Import Internal Dependencies
import { addSASTWarning, getDirNameFromUrl, getExpectedSemVer } from "../../src/utils/index.js";

// CONSTANTS
const kHomeDir = path.join(getDirNameFromUrl(import.meta.url), "..", "..");
const KSastDir = path.join(kHomeDir, "sastWarn");

test("should not match the range and return the latest version", async() => {
  const mockedPackument = sinon.stub(pacote, "packument").resolves({
    versions: ["1.2.0", "1.3.0"],
    "dist-tags": {
      latest: "1.3.0"
    }
  });

  const [version, isLatest] = await getExpectedSemVer("foobar", ">=1.5.0");
  assert.strictEqual(version, "1.3.0");
  assert.ok(isLatest);
  assert.ok(mockedPackument.calledOnce);

  mockedPackument.restore();
});

test("should return cleanedRange if packument throw an error", async() => {
  const mockedPackument = sinon.stub(pacote, "packument").throws();

  const [version, isLatest] = await getExpectedSemVer("foobar", ">=1.5.0");
  assert.strictEqual(version, "1.5.0");
  assert.ok(isLatest);
  assert.ok(mockedPackument.calledOnce);

  mockedPackument.restore();
});


test("should return true because the packge.json version is valid", () => {
  assert.strict(addSASTWarning(kHomeDir), true);
});

test("should return an error because the version is invalid", () => {
  try {
    fs.mkdirSync(KSastDir);
    fs.writeFileSync(path.join(KSastDir, "package.json"), JSON.stringify({ version: "0.0.0" }));

    assert.throws(
      () => addSASTWarning(KSastDir),
      {
        name: "Error",
        message: "The version of package.json is invalid"
      }
    );
  }
  finally {
    fs.rmSync(KSastDir, { force: true, recursive: true });
  }
});
