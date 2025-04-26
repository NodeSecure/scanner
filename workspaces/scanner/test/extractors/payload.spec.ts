// Import Node.js Dependencies
import { describe, it } from "node:test";
import assert from "node:assert";
import path from "node:path";
import fs from "node:fs";

// Import Internal Dependencies
import {
  Extractors,
  type Payload
} from "../../src/index.js";

// CONSTANTS
const kFixturePath = path.join("fixtures", "extractors");

// JSON PAYLOADS
const expressNodesecurePayload = JSON.parse(fs.readFileSync(
  new URL(path.join("..", kFixturePath, "express.json"), import.meta.url),
  "utf8"
)) as Payload;

describe("Extractors.Probes", () => {
  describe("ContactExtractor", () => {
    it("should extract Express.js contacts (Author, Maintainers ...)", () => {
      const extractor = new Extractors.Payload(
        expressNodesecurePayload,
        [
          new Extractors.Probes.ContactExtractor()
        ]
      );

      const { contacts } = extractor.extractAndMerge();

      assert.deepEqual(contacts, {
        "hello@blakeembrey.com": 23,
        "doug@somethingdoug.com": 46,
        "wes@wesleytodd.com": 12,
        "tj@vision-media.ca": 11,
        "jonathanrichardong@gmail.com": 15,
        "npm@jonchurch.com": 2,
        "ulisesgascondev@gmail.com": 8,
        "feross@feross.org": 2,
        "mathiasbuus@gmail.com": 1,
        "jaredhanson@gmail.com": 2,
        "shtylman@gmail.com": 2,
        "tj@learnboost.com": 1,
        "natevw@yahoo.com": 1,
        "me@jongleberry.com": 5,
        "sindresorhus@gmail.com": 1,
        "jean.burellier@gmail.com": 2,
        "linus@folkdatorn.se": 2,
        "matheus.frndes@gmail.com": 1,
        "rauchg@gmail.com": 1,
        "nick.tracey@vercel.com": 1,
        "infra+release@vercel.com": 1,
        "team@zeit.co": 1,
        "matt.j.straka@gmail.com": 1,
        "mindrun@icloud.com": 1,
        "i@izs.me": 1,
        "npm@josh.junon.me": 1,
        "rhyneandrew@gmail.com": 1,
        "nathan@tootallnate.net": 1,
        "whitequark@whitequark.org": 2,
        "quitlahok@gmail.com": 1,
        "ljharb@gmail.com": 35,
        "robert@broofa.com": 2,
        "niftylettuce@gmail.com": 1,
        "npm@titanism.com": 1,
        "npm@egeste.net": 1,
        "mail@substack.net": 1,
        "github@tixz.dk": 1,
        "chalkerx@gmail.com": 2,
        "ashtuchkin@gmail.com": 2,
        "raynos2@gmail.com": 2,
        "radu@jslog.com": 1,
        "mikeal.rogers@gmail.com": 1
      });
    });
  });

  describe("LicensesExtractor", () => {
    it("should extract Express.js licenses", () => {
      const extractor = new Extractors.Payload(
        expressNodesecurePayload,
        [
          new Extractors.Probes.LicensesExtractor()
        ]
      );

      const { licenses } = extractor.extractAndMerge();

      assert.deepEqual(licenses, {
        MIT: 66,
        ISC: 2,
        "BSD-3-Clause": 1
      });
    });
  });

  describe("SizeExtractor", () => {
    it("should extract Express.js dependencies size with no organizationPrefix", () => {
      const extractor = new Extractors.Payload(
        expressNodesecurePayload,
        [
          new Extractors.Probes.SizeExtractor()
        ]
      );

      const expectedSize = {
        all: "2.09 MB",
        /**
         * Note: internal is expected to be 0 B since organizationPrefix is undefined
         */
        internal: "0 B",
        external: "2.09 MB"
      };

      const extractResult = extractor.extract();
      assert.strictEqual(extractResult.length, 1);
      assert.deepEqual(extractResult, [{ size: expectedSize }]);

      const mergedResult = extractor.extractAndMerge();
      assert.deepEqual(mergedResult, { size: expectedSize });
      assert.deepEqual(mergedResult, extractResult[0]);
    });
  });

  it("should extract data with multiple extractors in once", () => {
    const extractor = new Extractors.Payload(
      expressNodesecurePayload,
      [
        new Extractors.Probes.SizeExtractor(),
        new Extractors.Probes.ContactExtractor(),
        new Extractors.Probes.LicensesExtractor()
      ]
    );

    const arrResult = extractor.extract();
    assert.strictEqual(arrResult.length, 3);

    const mergedResult = extractor.extractAndMerge();
    assert.deepEqual(
      Object.keys(mergedResult),
      ["size", "contacts", "licenses"]
    );
  });
});
