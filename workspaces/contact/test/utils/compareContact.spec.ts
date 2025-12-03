// Import Node.js Dependencies
import assert from "node:assert";
import { describe, test } from "node:test";

// Import Third-party Dependencies
import type { Contact } from "@nodesecure/npm-types";

// Import Internal Dependencies
import { compareContact } from "../../src/utils/index.ts";

describe("compareContact", () => {
  test("Given Contacts with the same name, it must return true", () => {
    const contactA: Contact = { name: "john doe" };
    const contactB: Contact = { name: "john doe" };

    assert.ok(
      compareContact(contactA, contactB)
    );
  });

  test("Given Contacts with the same name (parazited), it must return true", () => {
    const contactA: Contact = { name: " John doe" };
    const contactB: Contact = { name: "john  dOe  " };

    assert.ok(
      compareContact(contactA, contactB)
    );
  });

  test("Given Contacts with the same name but one is reversed, it must return true", () => {
    const contactA: Contact = { name: "john doe" };
    const contactB: Contact = { name: "doe john" };

    assert.ok(
      compareContact(contactA, contactB)
    );
  });

  test("Given two different Contacts name, it must return false", () => {
    const contactA: Contact = { name: "john doe" };
    const contactB: Contact = { name: "john cena" };

    assert.strictEqual(
      compareContact(contactA, contactB),
      false
    );
  });

  test("Given two different Contacts name but same email, it must return true", () => {
    const contactA: Contact = {
      name: "john doe",
      email: "john.doe@gmail.com"
    };
    const contactB: Contact = {
      name: "john cena",
      email: "john.doe@gmail.com"
    };

    assert.ok(
      compareContact(contactA, contactB)
    );
  });

  test("Given two different Contacts name but same email (parazited), it must return true", () => {
    const contactA: Contact = {
      name: "john doe",
      email: "john.doe@gMail.com"
    };
    const contactB: Contact = {
      name: "john cena",
      email: "  john.DOE@gmail.com  "
    };

    assert.ok(
      compareContact(contactA, contactB)
    );
  });

  test("Given two different Contacts name but same URL, it must return true", () => {
    const contactA: Contact = {
      name: "john doe",
      url: "https://google.fr"
    };
    const contactB: Contact = {
      name: "john cena",
      url: "https://google.fr"
    };

    assert.ok(
      compareContact(contactA, contactB)
    );
  });

  test("Given two different Contacts name but same URL (parazited), it must return true", () => {
    const contactA: Contact = {
      name: "john doe",
      url: "https://gOOgle.fr"
    };
    const contactB: Contact = {
      name: "john cena",
      url: "  https://google.fr  "
    };

    assert.ok(
      compareContact(contactA, contactB)
    );
  });

  test("Given the option compareName to false, then name should be ignored for comparaison", () => {
    const contactA: Contact = { name: "john doe" };
    const contactB: Contact = { name: "john doe" };

    assert.strictEqual(
      compareContact(contactA, contactB, { compareName: false }),
      false
    );
  });
});

