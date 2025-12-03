// Import Node.js Dependencies
import path from "node:path";
import fs from "node:fs";
import assert from "node:assert";
import { describe, test } from "node:test";

// Import Third-party Dependencies
import is from "@slimio/is";

// Import Internal Dependencies
import * as gitlab from "../../src/index.ts";

describe("download", () => {
  test("should be an asyncFunction", () => {
    assert.ok(is.func(gitlab.download));
    assert.ok(is.asyncFunction(gitlab.download));
  });

  test("must throw: repository must be a string!", async() => {
    await assert.rejects(
      async() => await gitlab.download(10 as any),
      {
        name: "TypeError",
        message: "repository must be a string!"
      }
    );
  });

  test("extract tar.gz at in the current working dir", async() => {
    try {
      const { location, ...resultRest } = await gitlab.download("polychromatic.plombier-chauffagiste");

      fs.accessSync(location);

      assert.strictEqual(path.extname(location), ".gz");
      assert.deepEqual(resultRest, {
        branch: "master",
        organization: "polychromatic",
        repository: "plombier-chauffagiste"
      });
    }
    finally {
      const tarGzLocation = path.join(process.cwd(), "plombier-chauffagiste-master.tar.gz");
      if (fs.existsSync(tarGzLocation)) {
        fs.unlinkSync(tarGzLocation);
      }
    }
  });
});
