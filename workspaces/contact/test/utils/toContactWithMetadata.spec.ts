// Import Node.js Dependencies
import assert from "node:assert";
import { describe, test } from "node:test";

// Import Third-party Dependencies
import type { Contact } from "@nodesecure/npm-types";

// Import Internal Dependencies
import {
  toContactWithMetadata,
  type ContactWithMetadata
} from "../../src/index.ts";

describe("toContactWithMetadata", () => {
  test("should transform to a contact without the free-domain flag", () => {
    const contact: Contact = {
      name: "john doe",
      email: "john@something.com",
      url: "john.com"
    };

    assert.deepEqual(toContactWithMetadata(contact), {
      name: "john doe",
      email: "john@something.com",
      flags: [],
      url: "john.com"
    });
  });

  test("should flag free domain", () => {
    const emails = [
      "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "live.com",
      "protonmail.com", "proton.me", "mail.ru", "yandex.ru", "qq.com",
      "163.com", "aol.com", "icloud.com", "zoho.com"
    ];

    emails.forEach((email) => {
      const freeEmailService = `john@${email}`;
      const contact: Contact = {
        name: "john doe",
        email: freeEmailService,
        url: "john.com"
      };

      assert.deepEqual(toContactWithMetadata(contact), {
        name: "john doe",
        email: freeEmailService,
        flags: ["free-email-service"],
        url: "john.com"
      });
    });
  });

  test("should do nothing when the contact is already a Nsecure one", () => {
    const contact: ContactWithMetadata = {
      name: "john doe",
      email: "johndoe@gmail.com",
      url: "john.com",
      flags: ["free-email-service"]
    };

    assert.deepEqual(toContactWithMetadata(contact), contact);
  });
});
