// Import Node.js Dependencies
import { fileURLToPath } from "url";

// Import Third-party Dependencies
import test from "tape";
import snapshot from "snap-shot-core";

// Import Internal Dependencies
import { verify } from "../index.js";

test.onFinish(snapshot.restore);

test("verify 'express' package", async(tape) => {
  const data = await verify("express@4.17.0");
  delete data.directorySize;

  snapshot.core({
    what: data,
    file: fileURLToPath(import.meta.url),
    specName: "verify express@4.17.0"
  });

  tape.end();
});
