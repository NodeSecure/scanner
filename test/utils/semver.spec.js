// Require Node.js Dependencies
import { afterEach, describe, it } from "node:test";
import assert from "node:assert";

// Import Third-party Dependencies
import pacote from "pacote";
import sinon from "sinon";

// Import Internal Dependencies
import { getExpectedSemVer } from "../../src/utils/index.js";

describe("semver", () => {
  it("should not match the range and return the latest version", async() => {
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

  it("should return cleanedRange if packument throw an error", async() => {
    const mockedPackument = sinon.stub(pacote, "packument").throws();

    const [version, isLatest] = await getExpectedSemVer("foobar", ">=1.5.0");
    assert.strictEqual(version, "1.5.0");
    assert.ok(isLatest);
    assert.ok(mockedPackument.calledOnce);

    mockedPackument.restore();
  });
});
