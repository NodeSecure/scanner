/* eslint-disable max-lines */
// Import Node.js Dependencies
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

// Import Third-party Dependencies
import type { Contact } from "@nodesecure/npm-types";

// Import Internal Dependencies
import {
  Extractors,
  type Payload
} from "../../src/index.ts";
import type {
  ExtractorCallbackParams
} from "../../src/extractors/payload.ts";

// CONSTANTS
const kFixturePath = path.join("fixtures", "extractors");

// JSON PAYLOADS
const expressNodesecurePayload = JSON.parse(fs.readFileSync(
  new URL(path.join("..", kFixturePath, "express.json"), import.meta.url),
  "utf8"
)) as Payload;
const strnumNodesecurePayload = JSON.parse(fs.readFileSync(
  new URL(path.join("..", kFixturePath, "strnum.json"), import.meta.url),
  "utf8"
)) as Payload;

describe("Extractors.Probes", () => {
  describe("Contacts", () => {
    it("should extract Express.js contacts (Author, Maintainers ...)", () => {
      const extractor = new Extractors.Payload(
        expressNodesecurePayload,
        [
          new Extractors.Probes.Contacts()
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

  describe("Licenses", () => {
    it("should extract Express.js licenses", () => {
      const extractor = new Extractors.Payload(
        expressNodesecurePayload,
        [
          new Extractors.Probes.Licenses()
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
          new Extractors.Probes.Size()
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

  describe("Warnings", () => {
    it("should extract strnum warnings", () => {
      const extractor = new Extractors.Payload(
        strnumNodesecurePayload,
        [
          new Extractors.Probes.Warnings()
        ]
      );

      const {
        warnings
      } = extractor.extractAndMerge();

      assert.strictEqual(warnings.count, 3);
      const keys = Object.keys(warnings.groups);
      assert.deepEqual(keys, ["strnum@1.1.2"]);

      assert.deepEqual(
        warnings.groups["strnum@1.1.2"].map((warning) => warning.kind),
        ["unsafe-regex", "unsafe-regex", "encoded-literal"]
      );
      assert.deepEqual(
        warnings.uniqueKinds,
        {
          "unsafe-regex": 2,
          "encoded-literal": 1
        }
      );
    });

    it("should extract strnum warnings with options useSpecAsKey: false", () => {
      const extractor = new Extractors.Payload(
        strnumNodesecurePayload,
        [
          new Extractors.Probes.Warnings({
            useSpecAsKey: false
          })
        ]
      );

      const {
        warnings
      } = extractor.extractAndMerge();

      assert.strictEqual(warnings.count, 3);
      const keys = Object.keys(warnings.groups);
      assert.deepEqual(keys, ["strnum"]);
    });
  });

  describe("Flags", () => {
    it("should extract strnum known flags", () => {
      const extractor = new Extractors.Payload(
        strnumNodesecurePayload,
        [
          new Extractors.Probes.Flags()
        ]
      );

      const {
        flags
      } = extractor.extractAndMerge();

      assert.deepEqual(
        flags,
        {
          hasWarnings: 1,
          isOutdated: 1,
          hasManyPublishers: 1
        }
      );
    });
  });

  describe("Vulnerabilities", () => {
    it("should extract strnum warnings", () => {
      const fakePayload: any = {
        id: "random-id",
        scannerVersion: "1.0.0",
        dependencies: {
          A: {
            vulnerabilities: ["foo"]
          },
          B: {
            vulnerabilities: ["bar"]
          }
        }
      };

      const extractor = new Extractors.Payload(fakePayload, [
        new Extractors.Probes.Vulnerabilities()
      ]);

      const { vulnerabilities } = extractor.extractAndMerge();

      assert.strictEqual(vulnerabilities.length, 2);
      assert.deepEqual(vulnerabilities, ["foo", "bar"]);
    });
  });

  it("should extract data with multiple extractors in once", () => {
    const extractor = new Extractors.Payload(expressNodesecurePayload, [
      new Extractors.Probes.Size(),
      new Extractors.Probes.Contacts(),
      new Extractors.Probes.Licenses()
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

describe("HihglightedContacts", () => {
  const fakePayload: any = {
    id: "random-id",
    scannerVersion: "1.0.0",
    dependencies: {
      express: {
        metadata: {
          author: { name: "TJ Holowaychuk", email: "tj@vision-media.ca" },
          maintainers: [
            { name: "wesleytodd", email: "wes@wesleytodd.com" },
            { name: "jonchurch", email: "npm@jonchurch.com" },
            { name: "ctcpip", email: "c@labsector.com" },
            { name: "sheplu", email: "jean.burellier@gmail.com" }
          ],
          publishers: []
        },
        versions: {
          "5.1.0": {
            author: { name: "TJ Holowaychuk", email: "tj@vision-media.ca" }
          }
        },
        vulnerabilities: []
      }
    }
  };
  it("Given a contact with no name, it should not throw an Error", () => {
    const highlighted = {
      email: "foobar@gmail.com"
    };

    const extractor = new Extractors.Payload(fakePayload, [
      new Extractors.Probes.HighlightedContacts(
        [highlighted]
      )
    ]);

    extractor.extractAndMerge();
  });

  it(`Given dependencies where the Highlighted Contact doesn't appears,
      it must return an empty Array`, () => {
    const highlighted: Contact = {
      name: "Ciaran Jessup"
    };
    const extractor = new Extractors.Payload(fakePayload, [
      new Extractors.Probes.HighlightedContacts(
        [highlighted]
      )
    ]);

    const { illuminated } = extractor.extractAndMerge();
    assert.strictEqual(illuminated.length, 0);
  });

  it(`Given dependencies where the Highlighted Contact is the author of the package,
      it should successfully scan, extract, and return the contact along with the list of dependencies where it appears.
      `, () => {
    const highlighted: Contact = {
      name: "TJ Holowaychuk"
    };
    const extractor = new Extractors.Payload(fakePayload, [
      new Extractors.Probes.HighlightedContacts(
        [highlighted]
      )
    ]);

    const { illuminated } = extractor.extractAndMerge();
    assert.deepEqual(
      illuminated,
      [
        { name: "TJ Holowaychuk", dependencies: ["express"] }
      ]
    );
  });

  it(`Given dependencies where the Highlighted Contact are maintainers of the package,
      it should successfully scan, extract, and return the contact along with the list of dependencies where it appears.
      `, () => {
    const extractor = new Extractors.Payload(fakePayload, [
      new Extractors.Probes.HighlightedContacts(
        [{
          name: "/.*church/", email: "npm@jonchurch.com"
        },
        { email: "c@labsector.com" }]
      )
    ]);

    const { illuminated } = extractor.extractAndMerge();
    assert.deepEqual(
      illuminated,
      [
        { name: "/.*church/", email: "npm@jonchurch.com", dependencies: ["express"] },
        { email: "c@labsector.com", dependencies: ["express"] }
      ]
    );
  });
});

describe("HighlightedPackages", () => {
  it("slould highlight packages that are already well formated", () => {
    const fakePayload: any = {
      id: "random-id",
      scannerVersion: "1.0.0",
      dependencies: {
        foo: {
          versions: {
            "1.2.3": {},
            "1.2.4": {}
          }
        },
        bar: {
          versions: {
            "1.2.3": {},
            "1.2.4": {},
            "1.2.5": {}
          }
        }
      }
    };
    const extractor = new Extractors.Payload(fakePayload, [
      new Extractors.Probes.HighlightedPackages(
        {
          foo: ["1.2.3"],
          bar: ["1.2.3", "1.2.4"]
        }
      )
    ]);
    const { highlightedPackages } = extractor.extractAndMerge();

    assert.strictEqual(highlightedPackages.length, 3);
    assert.deepEqual(highlightedPackages, ["foo@1.2.3", "bar@1.2.3", "bar@1.2.4"]);
  });

  it("slould highlight packages when the package to hightlight is an array of strings", () => {
    const fakePayload: any = {
      id: "random-id",
      scannerVersion: "1.0.0",
      dependencies: {
        foo: {
          versions: {
            "1.2.3": {},
            "1.2.4": {}
          }
        },
        bar: {
          versions: {
            "1.2.3": {},
            "1.2.4": {},
            "1.2.5": {}
          }
        }
      }
    };
    const extractor = new Extractors.Payload(fakePayload, [
      new Extractors.Probes.HighlightedPackages(
        ["foo@1.2.3", "bar@1.2.3", "bar@1.2.4"]
      )
    ]);
    const { highlightedPackages } = extractor.extractAndMerge();

    assert.strictEqual(highlightedPackages.length, 3);
    assert.deepEqual(highlightedPackages, ["foo@1.2.3", "bar@1.2.3", "bar@1.2.4"]);
  });

  it("slould highlight packages when the package to hightlight is a record of arrays of specs", () => {
    const fakePayload: any = {
      id: "random-id",
      scannerVersion: "1.0.0",
      dependencies: {
        foo: {
          versions: {
            "1.2.3": {},
            "1.2.4": {}
          }
        },
        bar: {
          versions: {
            "1.2.3": {},
            "1.2.4": {},
            "1.2.5": {}
          }
        }
      }
    };
    const extractor = new Extractors.Payload(fakePayload, [
      new Extractors.Probes.HighlightedPackages(
        ["foo@1.2.3", "bar@1.2.3", "bar@1.2.4"]
      )
    ]);
    const { highlightedPackages } = extractor.extractAndMerge();

    assert.strictEqual(highlightedPackages.length, 3);
    assert.deepEqual(highlightedPackages, ["foo@1.2.3", "bar@1.2.3", "bar@1.2.4"]);
  });

  it("should not highlight a package that is not in the payload", () => {
    const fakePayload: any = {
      id: "random-id",
      scannerVersion: "1.0.0",
      dependencies: {
        foo: {
          versions: {
            "1.2.3": {},
            "1.2.4": {}
          }
        },
        bar: {
          versions: {
            "1.2.3": {},
            "1.2.5": {}
          }
        }
      }
    };
    const extractor = new Extractors.Payload(fakePayload, [
      new Extractors.Probes.HighlightedPackages(
        ["foo@1.2.3", "bar@1.2.3", "bar@1.2.4"]
      )
    ]);
    const { highlightedPackages } = extractor.extractAndMerge();

    assert.strictEqual(highlightedPackages.length, 2);
    assert.deepEqual(highlightedPackages, ["foo@1.2.3", "bar@1.2.3"]);
  });

  it("should not crash when there is an invalid spec", () => {
    const fakePayload: any = {
      id: "random-id",
      scannerVersion: "1.0.0",
      dependencies: {
        foo: {
          versions: {
            "1.2.3": {},
            "1.2.4": {}
          }
        },
        bar: {
          versions: {
            "1.2.3": {},
            "1.2.5": {}
          }
        }
      }
    };
    const extractor = new Extractors.Payload(fakePayload, [
      new Extractors.Probes.HighlightedPackages(
        [""]
      )
    ]);
    const { highlightedPackages } = extractor.extractAndMerge();

    assert.strictEqual(highlightedPackages.length, 0);
  });

  it("should match every versions when there is no versions", () => {
    const fakePayload: any = {
      id: "random-id",
      scannerVersion: "1.0.0",
      dependencies: {
        mocha: {
          versions: {
            "1.2.3": {},
            "1.2.4": {}
          }
        },
        jest: {
          versions: {
            "1.2.1": {},
            "1.2.5": {}
          }
        }
      }
    };

    const extractor = new Extractors.Payload(fakePayload, [
      new Extractors.Probes.HighlightedPackages(
        ["mocha", "jest@1.2.1", "jest"]
      )
    ]);
    const { highlightedPackages } = extractor.extractAndMerge();

    assert.strictEqual(highlightedPackages.length, 4);
    assert.deepEqual(highlightedPackages, ["mocha@1.2.3", "mocha@1.2.4", "jest@1.2.1", "jest@1.2.5"]);
  });

  it("should highlight packages with org in their name", () => {
    const fakePayload: any = {
      id: "random-id",
      scannerVersion: "1.0.0",
      dependencies: {
        "@nodesecure/js-x-ray": {
          versions: {
            "1.0.0": {},
            "1.0.1": {}
          }
        },
        jest: {
          versions: {
            "1.2.1": {},
            "1.2.5": {}
          }
        }
      }
    };

    const extractor = new Extractors.Payload(fakePayload, [
      new Extractors.Probes.HighlightedPackages(
        ["@nodesecure/js-x-ray@1.0.0", "@nodesecure/js-x-ray@1.0.1"]
      )
    ]);
    const { highlightedPackages } = extractor.extractAndMerge();

    assert.strictEqual(highlightedPackages.length, 2);
    assert.deepEqual(highlightedPackages, ["@nodesecure/js-x-ray@1.0.0", "@nodesecure/js-x-ray@1.0.1"]);
  });

  it("should highlight every package from an org", () => {
    const fakePayload: any = {
      id: "random-id",
      scannerVersion: "1.0.0",
      dependencies: {
        "@nodesecure/js-x-ray": {
          versions: {
            "1.0.0": {},
            "1.0.1": {}
          }
        },
        "@nodesecure/scanner": {
          versions: {
            "1.2.1": {}
          }
        },
        foo: {
          versions: {
            "1.0.0": {}
          }
        },
        bar: {
          versions: {
            "1.0.0": {}
          }
        }
      }
    };

    const extractor = new Extractors.Payload(fakePayload, [
      new Extractors.Probes.HighlightedPackages(
        ["@nodesecure", "foo@1.0.0"]
      )
    ]);
    const { highlightedPackages } = extractor.extractAndMerge();

    assert.strictEqual(highlightedPackages.length, 4);
    assert.deepEqual(highlightedPackages, [
      "@nodesecure/js-x-ray@1.0.0",
      "@nodesecure/js-x-ray@1.0.1",
      "@nodesecure/scanner@1.2.1",
      "foo@1.0.0"
    ]);
  });
});

describe("Extractors.Payload events", () => {
  it("should emits packument and manifest events", () => {
    const extractor = new Extractors.Payload(
      expressNodesecurePayload,
      [
        new Extractors.Probes.Licenses(),
        new Extractors.Probes.Vulnerabilities()
      ]
    );

    const manifestEvents: ExtractorCallbackParams<"manifest">[] = [];
    const packumentEvents: ExtractorCallbackParams<"packument">[] = [];

    extractor.on("manifest", (...event) => {
      manifestEvents.push(event);
    });

    extractor.on("packument", (...event) => {
      packumentEvents.push(event);
    });

    const dependencies = Object.entries(expressNodesecurePayload.dependencies);

    const expectedPackumentEvents = dependencies;
    const expectedManifestEvents = dependencies.flatMap(([name, dependency]) => Object
      .entries(dependency.versions)
      .map(
        ([spec, depVersion]) => [spec, depVersion, { name, dependency }]
      )
    );

    extractor.extract();
    assert.deepEqual(packumentEvents, expectedPackumentEvents);
    assert.deepEqual(manifestEvents, expectedManifestEvents);
  });

  it("should emit error when extraction listener goes wrong", () => {
    const extractor = new Extractors.Payload(
      expressNodesecurePayload,
      [
        new Extractors.Probes.Licenses()
      ]
    );

    const error = new Error("Listener error");
    extractor.on("packument", () => {
      throw error;
    });

    const packumentListenerErrors: Error[] = [];

    extractor.on("error", (error) => {
      packumentListenerErrors.push(error.cause as Error);
    });

    extractor.extract();

    const expectedPackumentListenerErrors = packumentListenerErrors.map(() => error);
    assert.deepEqual(packumentListenerErrors, expectedPackumentListenerErrors);
  });
});

describe("Extractors.Callbacks", () => {
  it("should extract name and versions for all packages", () => {
    const packages = new Map<string, string[]>();

    const extractor = new Extractors.Payload(expressNodesecurePayload, [
      Extractors.Callbacks.packument((name) => {
        if (!packages.has(name)) {
          packages.set(name, []);
        }
      }),
      Extractors.Callbacks.manifest((spec, _, parent) => {
        if (packages.has(parent.name)) {
          packages.get(parent.name)!.push(spec);
        }
      })
    ]
    );

    extractor.extract();

    assert.deepEqual(
      Object.fromEntries(packages),
      {
        etag: ["1.8.1"],
        setprototypeof: ["1.2.0"],
        methods: ["1.1.2"],
        depd: ["2.0.0"],
        fresh: ["0.5.2"],
        vary: ["1.1.2"],
        "escape-html": ["1.0.3"],
        encodeurl: ["2.0.0", "1.0.2"],
        statuses: ["2.0.1"],
        "content-type": ["1.0.5"],
        "safe-buffer": ["5.2.1"],
        "range-parser": ["1.2.1"],
        "utils-merge": ["1.0.1"],
        "array-flatten": ["1.1.1"],
        cookie: ["0.7.1"],
        "cookie-signature": ["1.0.6"],
        parseurl: ["1.3.3"],
        "merge-descriptors": ["1.0.3"],
        "path-to-regexp": ["0.1.12"],
        "content-disposition": ["0.5.4"],
        "ee-first": ["1.1.1"],
        "on-finished": ["2.4.1"],
        negotiator: ["0.6.3"],
        accepts: ["1.3.8"],
        forwarded: ["0.2.0"],
        ms: ["2.1.3", "2.0.0"],
        inherits: ["2.0.4"],
        debug: ["2.6.9"],
        "ipaddr.js": ["1.9.1"],
        "proxy-addr": ["2.0.7"],
        qs: ["6.13.0"],
        mime: ["1.6.0"],
        "mime-db": ["1.52.0"],
        "mime-types": ["2.1.35"],
        bytes: ["3.1.2"],
        unpipe: ["1.0.0"],
        toidentifier: ["1.0.1"],
        "http-errors": ["2.0.0"],
        destroy: ["1.2.0"],
        "media-typer": ["0.3.0"],
        "type-is": ["1.6.18"],
        "es-errors": ["1.3.0"],
        send: ["0.19.0"],
        finalhandler: ["1.3.1"],
        "object-inspect": ["1.13.3"],
        "serve-static": ["1.16.2"],
        "side-channel-list": ["1.0.0"],
        "safer-buffer": ["2.1.2"],
        "iconv-lite": ["0.4.24"],
        "raw-body": ["2.5.2"],
        "body-parser": ["1.20.3"],
        "function-bind": ["1.1.2"],
        "call-bind-apply-helpers": ["1.0.1"],
        "es-define-property": ["1.0.1"],
        "es-object-atoms": ["1.1.1"],
        gopd: ["1.2.0"],
        "dunder-proto": ["1.0.1"],
        "get-proto": ["1.0.1"],
        "has-symbols": ["1.1.0"],
        hasown: ["2.0.2"],
        "math-intrinsics": ["1.1.0"],
        "get-intrinsic": ["1.2.7"],
        "call-bound": ["1.0.3"],
        "side-channel-map": ["1.0.1"],
        "side-channel-weakmap": ["1.0.2"],
        "side-channel": ["1.1.0"],
        express: ["4.21.2"]
      }
    );
  });

  describe("Extensions", () => {
    it("should extract extensions", () => {
      const extractor = new Extractors.Payload(
        expressNodesecurePayload,
        [
          new Extractors.Probes.Extensions()
        ]
      );

      const {
        extensions
      } = extractor.extractAndMerge();

      assert.deepEqual(extensions, {
        ".js": 69,
        ".json": 69,
        ".md": 69,
        ".ts": 20,
        ".yml": 20,
        ".markdown": 1
      });
    });
  });

  describe("NodeDependencies", () => {
    const extractor = new Extractors.Payload(
      expressNodesecurePayload,
      [
        new Extractors.Probes.NodeDependencies()
      ]
    );

    const { nodeDeps } = extractor.extractAndMerge();

    assert.deepEqual(nodeDeps.sort(), [
      "stream",
      "tty",
      "util",
      "fs",
      "net",
      "crypto",
      "assert",
      "http",
      "path",
      "buffer",
      "url",
      "async_hooks",
      "events",
      "zlib",
      "string_decoder",
      "querystring"
    ].sort());
  });
});
