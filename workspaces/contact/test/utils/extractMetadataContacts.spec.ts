// Import Node.js Dependencies
import assert from "node:assert";
import { describe, test } from "node:test";

// Import Third-party Dependencies
import type { Contact } from "@nodesecure/npm-types";

// Import Internal Dependencies
import { extractMetadataContacts } from "../../src/index.ts";

describe("extractMetadataContacts", () => {
  test("Given an empty metadata object, it must return an empty array", () => {
    assert.deepEqual(
      extractMetadataContacts({}),
      []
    );
  });

  test("Given only an author, it must return it as a ContactWithMetadata", () => {
    const author: Contact = {
      name: "john doe",
      email: "john@something.com"
    };

    assert.deepEqual(
      extractMetadataContacts({ author }),
      [
        { name: "john doe", email: "john@something.com", flags: [] }
      ]
    );
  });

  test("Given only maintainers, it must return them as ContactWithMetadata", () => {
    const maintainers: Contact[] = [
      { name: "john doe" },
      { name: "jane doe", email: "jane@gmail.com" }
    ];

    assert.deepEqual(
      extractMetadataContacts({ maintainers }),
      [
        { name: "john doe", flags: [] },
        { name: "jane doe", email: "jane@gmail.com", flags: ["free-email-service"] }
      ]
    );
  });

  test("Given both an author and maintainers, it must return the author first followed by the maintainers", () => {
    const author: Contact = { name: "john doe" };
    const maintainers: Contact[] = [
      { name: "jane doe" },
      { name: "jack doe" }
    ];

    assert.deepEqual(
      extractMetadataContacts({ author, maintainers }),
      [
        { name: "john doe", flags: [] },
        { name: "jane doe", flags: [] },
        { name: "jack doe", flags: [] }
      ]
    );
  });

  test("Given a null author, it must be ignored", () => {
    assert.deepEqual(
      extractMetadataContacts({ author: null, maintainers: [{ name: "jane doe" }] }),
      [
        { name: "jane doe", flags: [] }
      ]
    );
  });

  test("Given an author already flagged as ContactWithMetadata, it must be returned as-is", () => {
    const author = {
      name: "john doe",
      email: "john@gmail.com",
      flags: ["free-email-service"] as const
    };

    assert.deepEqual(
      extractMetadataContacts({ author }),
      [author]
    );
  });
});
