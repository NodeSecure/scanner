// Require Third-party Dependencies
import is from "@slimio/is";

// Require Internal Dependencies
import applyWarnings from "../src/warnings.js";

test("applyWarnings for '@scarf/scarf'", () => {
  const deps = new Map([
    ["@scarf/scarf", true]
  ]);

  const warnsArray = applyWarnings(deps);
  expect(is.array(warnsArray)).toBe(true);
  expect(warnsArray.length).toStrictEqual(1);
  // eslint-disable-next-line max-len
  expect(warnsArray[0]).toStrictEqual("The dependency '@scarf/scarf' has been detected in the dependency Tree. This dependency could collect data against your will so think to disable it with the env var: SCARF_ANALYTICS");
});
