// Require Third-party Dependencies
import is from "@slimio/is";
import test from "tape";

// Require Internal Dependencies
import { getDependenciesWarnings } from "../../src/utils/index.js";

test("getDependenciesWarnings for '@scarf/scarf'", (tape) => {
  const deps = new Map([
    ["@scarf/scarf", true]
  ]);

  const warnsArray = getDependenciesWarnings(deps);
  tape.true(is.array(warnsArray));
  tape.strictEqual(warnsArray.length, 1);

  tape.strictEqual(
    warnsArray[0],
    // eslint-disable-next-line max-len
    "The dependency '@scarf/scarf' has been detected in the dependency Tree. This dependency could collect data against your will so think to disable it with the env var: SCARF_ANALYTICS"
  );

  tape.end();
});
