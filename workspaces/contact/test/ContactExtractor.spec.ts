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
  test("Given a contact with no name, it should not throw an Error", async() => {
    const highlighted = {
      email: "foobar@gmail.com"
    };
    const extractor = new ContactExtractor({
      highlight: [highlighted]
    });

    const dependencies: Record<string, ContactExtractorPackageMetadata> = {
      random: fakePackageMetadata()
    };

    await extractor.fromDependencies(dependencies);
  });

  describe("fromDependencies", () => {
    test(`Given three dependencies where the Highlighted Contact appears two times,
      it should successfully scan, extract, and return the contact along with the list of dependencies where it appears.`
    , async() => {
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

      const { illuminated } = await extractor.fromDependencies(dependencies);
      assert.deepEqual(
        illuminated,
        [
          { ...highlighted, dependencies: ["kleur", "mocha"] }
        ]
      );
    });

    test(`Given a Contact with a RegExp name and three dependencies where the name appears two times,
      it should successfully scan, extract, and return the contact along with the list of dependencies where it appears.`
    , async() => {
      const highlighted: Contact = {
        name: "/.*xxaaahelllowwworld.*/i"
      };
      const extractor = new ContactExtractor({
        highlight: [highlighted]
      });

      const dependencies: Record<string, ContactExtractorPackageMetadata> = {
        kleur: fakePackageMetadata({ name: "random,xxaaahelLLowwworld" }, "author"),
        mocha: fakePackageMetadata({ name: "xxaaahelllowwworld.foobar" }, "maintainer"),
        random: fakePackageMetadata()
      };

      const { illuminated } = await extractor.fromDependencies(dependencies);
      assert.deepEqual(
        illuminated,
        [
          {
            ...highlighted,
            dependencies: ["kleur", "mocha"]
          }
        ]
      );
    });

    test(`Given dependencies where the Highlighted Contact doesn't appears,
      it must return an empty Array`, async() => {
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

      const { illuminated } = await extractor.fromDependencies(dependencies);
      assert.strictEqual(illuminated.length, 0);
    });

    test("Given a Contact with a non-existing email domain, it must be identified as expired", async() => {
      const extractor = new ContactExtractor({
        highlight: []
      });
      const expiredEmail = "john.doe+test@somenonexistentdomainongoogle9991254874x54x54.com";

      const dependencies: Record<string, ContactExtractorPackageMetadata> = {
        kleur: {
          author: {
            name: "john doe",
            email: expiredEmail
          },
          maintainers: []
        }
      };

      const { expired } = await extractor.fromDependencies(dependencies);
      assert.deepEqual(expired, [expiredEmail]);
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
  }

  return {
    author: currentAuthor,
    maintainers
  };
}

function getRandomInt(max: number): number {
  return Math.floor(Math.random() * max);
}
