// Require Third-party Dependencies
import is from "@slimio/is";
import test from "tape";

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

test("getDependenciesWarnings for '@scarf/scarf'", async(tape) => {
  const deps = new Map([
    ["@scarf/scarf", createDependency()]
  ]);

  const warnsArray = await getDependenciesWarnings(deps);
  tape.strictEqual(warnsArray.warnings.length, 1);

  tape.strictEqual(
    warnsArray.warnings[0],
    // eslint-disable-next-line max-len
    "The dependency '@scarf/scarf' has been detected in the dependency Tree. This dependency could collect data against your will so think to disable it with the env var: SCARF_ANALYTICS"
  );

  tape.end();
});
