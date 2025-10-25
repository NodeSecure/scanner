// Import Node.js Dependencies
import * as fs from "node:fs";
import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import Third-party Dependencies
import Config from "@npmcli/config";

// Import Internal Dependencies
import { RegistryTokenStore } from "../src/registry/RegistryTokenStore.js";

const require = createRequire(import.meta.url);

describe("RegistryTokenStore", () => {
  const npmrc = `
registry=https://registry.npmjs.org/
always-auth=true
//registry.npmjs.org/:_authToken=public-token

@nodescure:registry=http://npm.nodescure.github.com/
//npm.nodescure.github.com/:_authToken=private-token
`;
  const npmRcPath = path.join(process.cwd(), "..", "..", ".npmrc");

  let config: Config;

  beforeEach(async() => {
    fs.writeFileSync(npmRcPath, npmrc);
    const { shorthands, definitions, flatten } = require("@npmcli/config/lib/definitions");
    config = new Config({
      npmPath: path.resolve(__dirname, "."),
      definitions,
      shorthands,
      flatten
    });

    await config.load();
    config.validate();
  });

  afterEach(() => {
    fs.rmSync(npmRcPath);
  });

  test("should store and retrieve tokens", async() => {
    const store = new RegistryTokenStore(config, undefined);
    assert.strictEqual(store.get("https://registry.npmjs.org/"), "public-token");
    assert.strictEqual(store.get("http://npm.nodescure.github.com/"), "private-token");
    assert.strictEqual(store.get("https://registry.npmjs.org/"), "public-token");
    assert.strictEqual(store.get("unknown"), undefined);
  });

  test("should default to token from env when there is one", () => {
    const store = new RegistryTokenStore(config, "token-from-env");
    assert.strictEqual(store.get("unknown"), "token-from-env");
    assert.strictEqual(store.get("unknown"), "token-from-env");
  });

  test("should always default to token from env when there is no config", () => {
    const store = new RegistryTokenStore(undefined, "token-from-env");
    assert.strictEqual(store.get("https://registry.npmjs.org/"), "token-from-env");
  });
});
