// Import Third-party Dependencies
import test from "tape";

// Import Internal Dependencies
import { getPackageName } from "../../src/utils/index.js";

test("getPackageName should return the package name (if there is not slash char at all)", (tape) => {
  tape.is(getPackageName("mocha"), "mocha");

  tape.end();
});

test("getPackageName should return the package name (first part before '/' character)", (tape) => {
  tape.is(getPackageName("foo/bar"), "foo");

  tape.end();
});

test("getPackageName should return the package name with organization namespace", (tape) => {
  tape.is(getPackageName("@slimio/is/test"), "@slimio/is");

  tape.end();
});
