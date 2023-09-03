// Require Node.js Dependencies
import { test } from "node:test";
import assert from "node:assert";

// Import Third-party Dependencies
import * as i18n from "@nodesecure/i18n";
import * as rc from "@nodesecure/rc";

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

// test("getDependenciesWarnings for '@scarf/scarf'", async() => {
//   const deps = new Map([
//     ["@scarf/scarf", createDependency()]
//   ]);

//   const { warnings, flaggedAuthors } = await getDependenciesWarnings(deps);
//   assert.strictEqual(flaggedAuthors.length, 0);
//   assert.strictEqual(warnings.length, 1);

//   const message = await i18n.getToken("scanner.disable_scarf");
//   assert.ok(
//     warnings.at(0).includes(message)
//   );
// });

test("getDependenciesWarnings (flag author)", async() => {
  const deps = new Map([
    ["foobar", createDependency()]
  ]);

  rc.memoize({
    scanner: {
      flaggedAuthors: [
        {
          name: "John Doe",
          email: "john.doe@gmail.com"
        }
      ]
    }
  });

  const { warnings, flaggedAuthors } = await getDependenciesWarnings(deps);
  console.log(flaggedAuthors);

  assert.strictEqual(warnings.length, 0);
  assert.strictEqual(flaggedAuthors.length, 1);

  console.log(flaggedAuthors);
});

