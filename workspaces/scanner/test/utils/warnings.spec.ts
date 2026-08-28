// Import Node.js Dependencies
import { describe, it } from "node:test";
import assert from "node:assert/strict";

// Import Third-party Dependencies
import * as i18n from "@nodesecure/i18n";
import type { Packument } from "@nodesecure/npm-types";
import { HttpieOnHttpError } from "@openally/httpie";
import { getNpmRegistryURL } from "@nodesecure/npm-registry-sdk";

// Import Internal Dependencies
import {
  getDependenciesWarnings,
  getNpxAndBinConfusionWarnings
} from "../../src/utils/index.ts";
import type {
  Dependency,
  NpxConfusion,
  BinConfusion,
  NpxConfusionWarning,
  BinConfusionWarning
} from "../../src/types.ts";

function createDependency(
  maintainers = [],
  publishers = []
) {
  return {
    metadata: {
      authors: {
        name: "John Doe",
        email: "john.doe@gmail.com"
      },
      maintainers,
      publishers
    }
  } as unknown as Dependency;
}

// warnings are pushed from promise callbacks, so a claimed binary (resolved
// packument) always lands before an unclaimed one (rejected packument).
// that ordering is an artifact of promise scheduling, not of the input.
function sortByMessage(
  warnings: (NpxConfusionWarning | BinConfusionWarning)[]
) {
  return [...warnings].sort(
    (left, right) => left.message.localeCompare(right.message)
  );
}

describe("utils.getDependenciesWarnings", () => {
  it("should warn for library '@scarf/scarf'", async() => {
    const deps = new Map<string, Dependency>([
      ["@scarf/scarf", createDependency()]
    ]);

    const warnsArray = await getDependenciesWarnings(deps);
    assert.strictEqual(warnsArray.warnings.length, 1);

    const message = await i18n.getToken("scanner.disable_scarf");

    const warning = warnsArray.warnings[0];
    assert.strictEqual(warning.type, "dangerous-dependency");
    assert.ok(
      warning.message.includes(message)
    );
  });

  it("should warn for library 'iohook'", async() => {
    const deps = new Map<string, Dependency>([
      ["iohook", createDependency()]
    ]);

    const warnsArray = await getDependenciesWarnings(deps);
    assert.strictEqual(warnsArray.warnings.length, 1);

    const message = await i18n.getToken("scanner.keylogging");

    const warning = warnsArray.warnings[0];
    assert.strictEqual(warning.type, "dangerous-dependency");
    assert.ok(
      warning.message.includes(message)
    );
  });
});

describe("getNpxAndBinConfusionWarnings", () => {
  it("should get bin and npx confusion warnings", async(t) => {
    const npxConfusions = new Map<string, NpxConfusion[]>([
      ["bar", [{
        name: "jest",
        version: "14.0.5",
        scriptName: "dev"
      }]],
      ["foo", [
        {
          name: "react",
          version: "19.0.0",
          scriptName: "start"
        },
        {
          name: "axios",
          version: "5.1.2",
          scriptName: "test"
        }
      ]],
      ["not-404", [{
        name: "lodash",
        version: "1.0.0",
        scriptName: "build"
      }]]
    ]);

    const binConfusions = new Map<string, BinConfusion[]>([
      ["foo", [{
        name: "jest",
        version: "14.0.5"
      }]],
      ["something", [
        {
          name: "react",
          version: "19.0.0"
        },
        {
          name: "axios",
          version: "5.1.2"
        }
      ]],
      ["not-404", [{
        name: "lodash",
        version: "1.0.0"
      }]]
    ]);

    const packumentMock = t.mock.fn<(name: string, options?: {
      registry: string;
      token?: string;
    }) => Promise<Packument>>();

    const getTokenMock = t.mock.fn<
      (token: string, ...params: any[]) => Promise<string>
    >();

    getTokenMock.mock.mockImplementation((token, ...params) => Promise.resolve(`${token} ${params
      .map((param) => String(param)).join(" ")}`));

    packumentMock.mock.mockImplementation((name) => {
      if (["something", "bar"].includes(name)) {
        return Promise.resolve({} as unknown as Packument);
      }

      if (name === "not-404") {
        return Promise.reject(new Error());
      }

      return Promise.reject(new HttpieOnHttpError({
        data: null,
        headers: {},
        statusMessage: "Not found",
        statusCode: 404
      }));
    });

    const warnings = await getNpxAndBinConfusionWarnings({
      packument: packumentMock,
      getToken: getTokenMock,
      npxConfusions,
      binConfusions,
      token: "token"
    });

    assert.strictEqual(packumentMock.mock.callCount(), 4);

    const registryOptions = {
      registry: getNpmRegistryURL(),
      token: "token"
    };
    assert.deepEqual(
      packumentMock.mock.calls.map((call) => call.arguments),
      [
        ["bar", registryOptions],
        ["foo", registryOptions],
        ["not-404", registryOptions],
        ["something", registryOptions]
      ]
    );

    // the two 'not-404' binaries fail with a non-404 error, so they are skipped
    assert.strictEqual(getTokenMock.mock.callCount(), 6);

    assert.deepEqual(sortByMessage(warnings), sortByMessage([
      {
        type: "npx-confusion",
        message: "scanner.npx_confusion_claimed bar dev jest@14.0.5",
        metadata: {
          name: "jest",
          version: "14.0.5",
          npxBinaryName: "bar",
          scriptName: "dev"
        }
      },
      {
        type: "npx-confusion",
        message: "scanner.npx_confusion_unclaimed foo start react@19.0.0",
        metadata: {
          name: "react",
          version: "19.0.0",
          npxBinaryName: "foo",
          scriptName: "start"
        }
      },
      {
        type: "npx-confusion",
        message: "scanner.npx_confusion_unclaimed foo test axios@5.1.2",
        metadata: {
          name: "axios",
          version: "5.1.2",
          npxBinaryName: "foo",
          scriptName: "test"
        }
      },
      {
        type: "bin-confusion",
        message: "scanner.bin_confusion_unclaimed foo jest@14.0.5",
        metadata: {
          name: "jest",
          version: "14.0.5",
          binaryName: "foo"
        }
      },
      {
        type: "bin-confusion",
        message: "scanner.bin_confusion_claimed something react@19.0.0",
        metadata: {
          name: "react",
          version: "19.0.0",
          binaryName: "something"
        }
      },
      {
        type: "bin-confusion",
        message: "scanner.bin_confusion_claimed something axios@5.1.2",
        metadata: {
          name: "axios",
          version: "5.1.2",
          binaryName: "something"
        }
      }
    ]));
  });
});
