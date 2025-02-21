// Import Node.js Dependencies
import assert from "node:assert/strict";
import { describe, it } from "node:test";

// Import Internal Dependencies
import * as utils from "../../src/utils/index.js";

describe("utils.manifestAuthor", () => {
  it("should return null when given undefined", () => {
    assert.strictEqual(utils.manifestAuthor(undefined), null);
  });

  it("should return null when given empty string", () => {
    assert.strictEqual(utils.manifestAuthor(""), null);
  });

  it("should return author object with only name", () => {
    assert.deepStrictEqual(utils.manifestAuthor("John Doe"), {
      name: "John Doe",
      email: void 0,
      url: void 0
    });
  });

  it("should return author object with name and email", () => {
    assert.deepStrictEqual(utils.manifestAuthor("John Doe <john@doe.com>"), {
      name: "John Doe",
      email: "john@doe.com",
      url: void 0
    });
  });

  it("should return author object with name, email and url", () => {
    assert.deepStrictEqual(utils.manifestAuthor("John Doe <john@doe.com> (john.com)"), {
      name: "John Doe",
      email: "john@doe.com",
      url: "john.com"
    });
  });

  it("should return given author object", () => {
    const author = {
      name: "John Doe",
      email: "john@doe.com",
      url: "john.com"
    };

    assert.deepStrictEqual(utils.manifestAuthor(author), author);
  });
});
