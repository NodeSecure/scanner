// Import Third-party Dependencies
import test from "tape";

// Import Internal Dependencies
import { isSensitiveFile } from "../../src/utils/index.js";

test("isSensitiveFile should return true for sensitive files", (tape) => {
  tape.true(isSensitiveFile(".npmrc"));
  tape.true(isSensitiveFile(".env"));

  tape.end();
});

test("isSensitiveFile should return true for sensitive extensions", (tape) => {
  tape.true(isSensitiveFile("lol.key"), ".key extension is sensible");
  tape.true(isSensitiveFile("bar.pem"), ".pem extension is sensible");

  tape.end();
});

test("isSensitiveFile should return false for classical extension or file name", (tape) => {
  tape.false(isSensitiveFile("test.js"));
  tape.false(isSensitiveFile(".eslintrc"));

  tape.end();
});
