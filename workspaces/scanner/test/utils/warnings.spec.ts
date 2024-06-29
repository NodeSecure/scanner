// Import Node.js Dependencies
import { test } from "node:test";
import assert from "node:assert";

// Import Third-party Dependencies
import * as i18n from "@nodesecure/i18n";

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

test("getDependenciesWarnings for '@scarf/scarf'", async() => {
  const deps = new Map([
    ["@scarf/scarf", createDependency()]
  ]);

  const warnsArray = await getDependenciesWarnings(deps);
  assert.strictEqual(warnsArray.warnings.length, 1);

  const message = await i18n.getToken("scanner.disable_scarf");
  assert.ok(
    warnsArray.warnings[0].includes(message)
  );
});
