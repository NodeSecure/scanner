// Import Node.js Dependencies
import assert from "node:assert";
import { describe, test } from "node:test";

// Import Third-party Dependencies
import type { Contact } from "@nodesecure/npm-types";
import { faker } from "@faker-js/faker";

// Import Internal Dependencies
import {
  ContactExtractor,
  type ContactExtractorPackageMetadata
} from "../src/index.js";

describe("ContactExtractor", () => {
  describe("fromDependencies", () => {
    test(`Given three dependencies where the Highlighted Contact appears two times,
      it should successfully scan, extract, and return the contact along with the list of dependencies where it appears.`, () => {
      const highlighted: Contact = {
        name: "john doe"
      };
      const extractor = new ContactExtractor({
        highlight: [highlighted]
      });

      const dependencies: Record<string, ContactExtractorPackageMetadata> = {
        kleur: fakePackageMetadata(highlighted, "author"),
        mocha: fakePackageMetadata(highlighted, "maintainer"),
        random: fakePackageMetadata()
      };

      const illuminateds = extractor.fromDependencies(dependencies);
      assert.deepEqual(
        illuminateds,
        [
          { ...highlighted, dependencies: ["kleur", "mocha"] }
        ]
      );
    });

    test(`Given a Contact with a RegExp name and three dependencies where the name appears two times,
      it should successfully scan, extract, and return the contact along with the list of dependencies where it appears.`, () => {
      const highlighted: Contact = {
        name: "/.*john.*/i"
      };
      const extractor = new ContactExtractor({
        highlight: [highlighted]
      });

      const dependencies: Record<string, ContactExtractorPackageMetadata> = {
        kleur: fakePackageMetadata({ name: "random,jOhn" }, "author"),
        mocha: fakePackageMetadata({ name: "john.foobar" }, "maintainer"),
        random: fakePackageMetadata()
      };

      const illuminateds = extractor.fromDependencies(dependencies);
      assert.deepEqual(
        illuminateds,
        [
          { ...highlighted, dependencies: ["kleur", "mocha"] }
        ]
      );
    });

    test(`Given dependencies where the Highlighted Contact doesn't appears,
      it must return an empty Array`, () => {
      const highlighted: Contact = {
        name: "john doe"
      };
      const extractor = new ContactExtractor({
        highlight: [highlighted]
      });

      const dependencies: Record<string, ContactExtractorPackageMetadata> = {
        kleur: fakePackageMetadata(),
        mocha: fakePackageMetadata(),
        random: fakePackageMetadata()
      };

      const illuminateds = extractor.fromDependencies(dependencies);
      assert.strictEqual(illuminateds.length, 0);
    });
  });
});

function fakePackageMetadata(
  highlighted?: Contact,
  location?: "any" | "maintainer" | "author"
): ContactExtractorPackageMetadata {
  // eslint-disable-next-line no-param-reassign
  location ??= "any";
  let appearAtLeastOnce = false;
  let numberOfMaintainers = getRandomInt(3);
  if (location === "maintainer" && !numberOfMaintainers) {
    numberOfMaintainers = 1;
  }

  const maintainers: Contact[] = [];
  for (let i = 0; i < numberOfMaintainers; i++) {
    let currentMaintainer: Contact = {
      name: faker.person.fullName()
    };
    if (highlighted && !appearAtLeastOnce && location !== "author") {
      currentMaintainer = structuredClone(highlighted);
      appearAtLeastOnce = true;
    }

    maintainers.push(currentMaintainer);
  }

  const hasAuthor = location === "author" ? true : (Math.random() > 0.5);
  if (!hasAuthor) {
    return { maintainers };
  }

  let currentAuthor: Contact = {
    name: faker.person.fullName()
  };
  if (highlighted && !appearAtLeastOnce) {
    currentAuthor = structuredClone(highlighted);
    appearAtLeastOnce = true;
  }

  return {
    author: currentAuthor,
    maintainers
  };
}

function getRandomInt(max: number): number {
  return Math.floor(Math.random() * max);
}
