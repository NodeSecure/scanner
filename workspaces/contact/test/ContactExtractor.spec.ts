// Import Node.js Dependencies
import assert from "node:assert";
import { describe, test } from "node:test";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

// Import Third-party Dependencies
import type { Contact, PackumentVersion, Packument } from "@nodesecure/npm-types";
import { faker } from "@faker-js/faker";

// Import Internal Dependencies
import {
  ContactExtractor,
  type ContactExtractorPackageMetadata
} from "../src/index.js";

// CONSTANTS
const __dirname = dirname(fileURLToPath(import.meta.url));
const kManifestFixturePath = join(__dirname, "fixtures", "manifest");
const kPackumentFixturePath = join(__dirname, "fixtures", "packument");
const kManifest: PackumentVersion = JSON.parse(readFileSync(join(kManifestFixturePath, "/manifest.json"), "utf8"));
const kPackument: Packument = JSON.parse(readFileSync(join(kPackumentFixturePath, "/packument.json"), "utf8"));

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

  describe("fromManifiest", () => {
    test(`Given dependencies where the Highlighted Contact doesn't appears,
      it must return an empty Array`, async() => {
      const highlighted: Contact = {
        name: "Ciaran Jessup"
      };
      const extractor = new ContactExtractor({
        highlight: [highlighted]
      });

      const { illuminated } = await extractor.fromManifest(kManifest);
      assert.strictEqual(illuminated.length, 0);
    });

    test(`Given dependencies where the Highlighted Contact is the author of the package,
      it should successfully scan, extract, and return the contact along with the list of dependencies where it appears.
      `, async() => {
      const highlighted: Contact = {
        name: "TJ Holowaychuk"
      };
      const extractor = new ContactExtractor({
        highlight: [highlighted]
      });

      const { illuminated } = await extractor.fromManifest(kManifest);
      assert.deepEqual(
        illuminated,
        [
          { name: "TJ Holowaychuk", dependencies: ["express"] }
        ]
      );
    });

    test(`Given dependencies where the Highlighted Contact are maintainers of the package,
      it should successfully scan, extract, and return the contact along with the list of dependencies where it appears.
      `, async() => {
      const extractor = new ContactExtractor({
        highlight: [{
          name: "/.*church/", email: "npm@jonchurch.com"
        },
        { email: "c@labsector.com" }
        ]
      });

      const { illuminated } = await extractor.fromManifest(kManifest);
      assert.deepEqual(
        illuminated,
        [
          { name: "/.*church/", email: "npm@jonchurch.com", dependencies: ["express"] },
          { email: "c@labsector.com", dependencies: ["express"] }
        ]
      );
    });

    test("Given a manifest with only active emails it shouldn't have any expired email", async() => {
      const extractor = new ContactExtractor({
        highlight: []
      });

      const { expired } = await extractor.fromManifest(kManifest);
      assert.deepEqual(expired, []);
    });

    test("Given a Contact with a non-existing email domain, it must be identified as expired", async() => {
      const extractor = new ContactExtractor({
        highlight: []
      });
      const expiredEmail = "john.doe+test@somenonexistentdomainongoogle9991254874x54x54.com";

      const { expired } = await extractor.fromManifest({ ...kManifest, author: { ...kManifest.author!, email: expiredEmail } });
      assert.deepEqual(expired, [expiredEmail]);
    });
  });

  describe("fromPackument", () => {
    test(`Given a packument where the Highlighted Contact doesn't appears,
      it must return an empty Array`, async() => {
      const highlighted: Contact = {
        name: "John Doe"
      };
      const extractor = new ContactExtractor({
        highlight: [highlighted]
      });

      const { illuminated } = await extractor.fromPackument(kPackument);
      assert.strictEqual(illuminated.length, 0);
    });

    test(`Given a packument where the Highlighted Contact is the author of the package,
      it should successfully scan, extract, and return the contact along with the list of dependencies where it appears.
      `, async() => {
      const highlighted: Contact = {
        name: "TJ Holowaychuk"
      };
      const extractor = new ContactExtractor({
        highlight: [highlighted]
      });

      const { illuminated } = await extractor.fromPackument(kPackument);
      assert.deepEqual(
        illuminated,
        [
          { name: "TJ Holowaychuk", dependencies: ["express"] }
        ]
      );
    });

    test(`Given a packument where the Highlighted Contact are maintainers of the package,
      it should successfully scan, extract, and return the contact along with the list of dependencies where it appears.
      `, async() => {
      const extractor = new ContactExtractor({
        highlight: [
          {
            name: "/.*ylman/",
            email: "shtylman@gmail.com"
          },
          {
            email: "doug@somethingdoug.com"
          }
        ]
      });

      const { illuminated } = await extractor.fromPackument(kPackument);
      assert.deepEqual(
        illuminated,
        [
          {
            name: "/.*ylman/",
            email: "shtylman@gmail.com",
            dependencies: ["express"]
          },
          {
            email: "doug@somethingdoug.com",
            dependencies: ["express"]
          }
        ]
      );
    });

    test("Given a packument with only active emails it shouldn't have any expired email", async() => {
      const extractor = new ContactExtractor({
        highlight: []
      });

      const { expired } = await extractor.fromPackument(kPackument);
      assert.deepEqual(expired, []);
    });

    test("Given a Contact with a non-existing email domain, it must be identified as expired", async() => {
      const extractor = new ContactExtractor({
        highlight: []
      });
      const expiredEmail = "john.doe+test@somenonexistentdomainongoogle9991254874x54x54.com";
      const versions = Object.entries(kPackument.versions)
        .reduce((acc: Record<string, PackumentVersion>, [version, value]) => {
          return {
            ...acc,
            [version]: {
              ...value,
              author: { name: value.author!.name, email: expiredEmail }
            }
          };
        }, {});

      const { expired } = await extractor.fromPackument({ ...kPackument, versions });
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
