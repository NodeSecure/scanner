// Import Third-party Dependencies
import test from "tape";

// Import Internal Dependencies
import { booleanToFlags } from "../../src/utils/index.js";

test("booleanToFlags should transform the Record in flag list where value are true", (tape) => {
  const flags = booleanToFlags({ hasScript: true, foo: false, bar: true });
  tape.deepEqual([...flags], ["hasScript", "bar"]);

  tape.end();
});
