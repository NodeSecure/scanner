// Import Node.js Dependencies
import { describe, it } from "node:test";
import assert from "node:assert";

// Import Internal Dependencies
import * as utils from "../src/parseManifestAuthor.js";

describe("parseAuthor", () => {
  it("should be able to parse a string (without email)", () => {
    const result = utils.parseAuthor("GENTILHOMME Thomas");
    assert.deepEqual(result, { name: "GENTILHOMME Thomas" });
  });

  it("should be able to parse a string (with email)", () => {
    const result = utils.parseAuthor("GENTILHOMME Thomas <foobar@gmail.com>");
    assert.deepEqual(result, {
      name: "GENTILHOMME Thomas",
      email: "foobar@gmail.com"
    });
  });

  it("should be able to parse an object matching Maintainer type", () => {
    const author: utils.ParsedMaintainer = {
      name: "GENTILHOMME Thomas",
      email: "foobar@gmail.com",
      url: "https://example.com/"
    };
    const result = utils.parseAuthor(author);
    assert.deepEqual(result, author);
  });

  it("should be able to parse an object not matching Maintainer type", () => {
    const author = {
      name: "GENTILHOMME Thomas",
      email: "foobar@gmail.com",
      unrelatedProperty: "unrelatedValue"
    };
    const result = utils.parseAuthor(author);
    assert.deepEqual(result, author);
  });

  it("should return null for an empty object", () => {
    const result = utils.parseAuthor({});
    assert.strictEqual(result, null);
  });

  it("should return null for undefined", () => {
    const result = utils.parseAuthor(undefined as unknown as string);
    assert.strictEqual(result, null);
  });
});

describe("manifestAuthorRegex", () => {
  it("must return a RegExp", () => {
    const regex = utils.manifestAuthorRegex();
    assert.ok(regex instanceof RegExp);
  });
});

describe("parseManifestAuthor", () => {
  it("parse a name field", () => {
    const result = utils.parseManifestAuthor("GENTILHOMME Thomas");
    assert.deepEqual(result, {
      name: "GENTILHOMME Thomas"
    });
  });

  it("parse a generic name <email> field", () => {
    const result = utils.parseManifestAuthor("GENTILHOMME Thomas <gentilhomme.thomas@gmail.com>");
    assert.deepEqual(result, {
      name: "GENTILHOMME Thomas",
      email: "gentilhomme.thomas@gmail.com"
    });
  });

  it("parse an author field with name, email and URL", () => {
    const result = utils.parseManifestAuthor("John-David Dalton <john.david.dalton@gmail.com> (http://allyoucanleet.com/)");
    assert.deepEqual(result, {
      name: "John-David Dalton",
      email: "john.david.dalton@gmail.com",
      url: "http://allyoucanleet.com/"
    });
  });

  it("parse an author field with name and URL", () => {
    const result = utils.parseManifestAuthor("John-David Dalton (http://allyoucanleet.com/)");
    assert.deepEqual(result, {
      name: "John-David Dalton",
      url: "http://allyoucanleet.com/"
    });
  });

  it("empty string must return empty object", () => {
    const result = utils.parseManifestAuthor("");
    assert.strictEqual(result, null);
  });

  it("must throw an Error if the argument is not a string", () => {
    try {
      utils.parseManifestAuthor(null as unknown as string);
    }
    catch (error) {
      assert.strictEqual(error.message, "expected manifestAuthorField to be a string");
    }
  });
});
