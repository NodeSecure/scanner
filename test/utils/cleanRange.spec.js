// Import Third-party Dependencies
import test from "tape";

// Import Internal Dependencies
import { cleanRange } from "../../src/utils/index.js";

test("cleanRange should return cleaned SemVer range", (tape) => {
  const r1 = cleanRange("0.1.0");
  const r2 = cleanRange("^1.0.0");
  const r3 = cleanRange(">=2.0.0");

  tape.strictEqual(r1, "0.1.0");
  tape.strictEqual(r2, "1.0.0");
  tape.strictEqual(r3, "2.0.0");

  tape.end();
});
