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
  const what = JSON.stringify(data);
  const out = snapshot.core({
    what,
    file: fileURLToPath(import.meta.url),
    specName: "verify express@4.17.0"
  });
  tape.deepEqual(out.value, what, "must match snapshot value for 'verify express@4.17.0'");

  tape.end();
});
