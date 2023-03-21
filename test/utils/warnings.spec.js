// Require Node.js Dependencies
import { afterEach, describe, it } from "node:test";
import assert from "node:assert";

// Require Internal Dependencies
import { getDependenciesWarnings } from "../../src/utils/index.js";

function createDependency(maintainers = [], publishers = []) {
  return {
    metadata: {
      authors: {
        name: "John Doe",
        email: "john.doe@gmail.com"
      },
      maintainers,
      publishers
    }
  };
}

describe("warnings", () => {
  it("getDependenciesWarnings for '@scarf/scarf'", async() => {
    const deps = new Map([
      ["@scarf/scarf", createDependency()]
    ]);

    const warnsArray = await getDependenciesWarnings(deps);
    assert.strictEqual(warnsArray.warnings.length, 1);

    assert.strictEqual(
      warnsArray.warnings[0],
      // eslint-disable-next-line max-len
      "The dependency '@scarf/scarf' has been detected in the dependency Tree. This dependency could collect data against your will so think to disable it with the env var: SCARF_ANALYTICS"
    );
  });
});
