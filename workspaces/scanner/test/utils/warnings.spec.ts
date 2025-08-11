// Import Node.js Dependencies
import { test } from "node:test";
import assert from "node:assert";

// Import Third-party Dependencies
import * as i18n from "@nodesecure/i18n";

// Import Internal Dependencies
import { getDependenciesWarnings } from "../../src/utils/index.js";
import type { Dependency } from "../../src/types.js";

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
  } as unknown as Dependency;
}

test("getDependenciesWarnings for library '@scarf/scarf'", async() => {
  const deps = new Map<string, Dependency>([
    ["@scarf/scarf", createDependency()]
  ]);

  const warnsArray = await getDependenciesWarnings(deps);
  assert.strictEqual(warnsArray.warnings.length, 1);

  const message = await i18n.getToken("scanner.disable_scarf");

  const warning = warnsArray.warnings[0];
  assert.strictEqual(warning.type, "dangerous-dependency");
  assert.ok(
    warning.message.includes(message)
  );
});

test("getDependenciesWarnings for library 'iohook'", async() => {
  const deps = new Map<string, Dependency>([
    ["iohook", createDependency()]
  ]);

  const warnsArray = await getDependenciesWarnings(deps);
  assert.strictEqual(warnsArray.warnings.length, 1);

  const message = await i18n.getToken("scanner.keylogging");

  const warning = warnsArray.warnings[0];
  assert.strictEqual(warning.type, "dangerous-dependency");
  assert.ok(
    warning.message.includes(message)
  );
});
