// Import Third-party Dependencies
import pacote from "pacote";
import test from "tape";
import sinon from "sinon";

// Import Internal Dependencies
import { getExpectedSemVer } from "../../src/utils/index.js";

test("should not match the range and return the latest version", async(tape) => {
  const mockedPackument = sinon.stub(pacote, "packument").resolves({
    versions: ["1.2.0", "1.3.0"],
    "dist-tags": {
      latest: "1.3.0"
    }
  });
  tape.teardown(() => mockedPackument.restore());

  const [version, isLatest] = await getExpectedSemVer("foobar", ">=1.5.0");
  tape.strictEqual(version, "1.3.0");
  tape.true(isLatest);
  tape.true(mockedPackument.calledOnce);

  tape.end();
});

test("should return cleanedRange if packument throw an error", async(tape) => {
  const mockedPackument = sinon.stub(pacote, "packument").throws();
  tape.teardown(() => mockedPackument.restore());

  const [version, isLatest] = await getExpectedSemVer("foobar", ">=1.5.0");
  tape.strictEqual(version, "1.5.0");
  tape.true(isLatest);
  tape.true(mockedPackument.calledOnce);

  tape.end();
});
