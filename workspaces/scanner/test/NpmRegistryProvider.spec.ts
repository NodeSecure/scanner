/* eslint-disable max-lines */
// Import Node.js Dependencies
import { test, describe } from "node:test";
import assert from "node:assert";

// Import Third-party Dependencies
import semver from "semver";
import is from "@slimio/is";
import * as i18n from "@nodesecure/i18n";
import { PackumentVersion, Packument } from "@nodesecure/npm-types";
import { getNpmRegistryURL } from "@nodesecure/npm-registry-sdk";
import { HttpieOnHttpError } from "@openally/httpie";

// Import Internal Dependencies
import { Logger, type Dependency, type DependencyConfusionWarning } from "../src/index.js";
import { NpmRegistryProvider } from "../src/registry/NpmRegistryProvider.js";

describe("NpmRegistryProvider", () => {
  async function dummyThrow(): Promise<any> {
    throw new HttpieOnHttpError({
      data: null,
      headers: {},
      statusMessage: "Not found",
      statusCode: 404
    });
  }
  const defaultNpmApiClient = {
    packument: dummyThrow,
    packumentVersion: dummyThrow,
    org: dummyThrow
  };

  describe("enrichDependencyVersion", async() => {
    const message = await i18n.getToken("scanner.dependency_confusion");
    const messageMissing = await i18n.getToken("scanner.dependency_confusion_missing");
    test("should not throw error when package does not exist", async() => {
      const provider = new NpmRegistryProvider("foobarrxldkedeoxcjek", "1.5.0");

      await provider.enrichDependencyVersion({} as any, [], null);
    });

    test("should enrich dependency with manifest metadata and links for valid package", async() => {
      const dep = {
        metadata: {
          integrity: {}
        },
        versions: {
          "1.5.0": {}
        }
      };
      const provider = new NpmRegistryProvider("@slimio/is", "1.5.0");

      await provider.enrichDependencyVersion(dep as any, [], "slimio");

      assert.equal(Object.keys(dep.metadata).length, 1);
      assert.deepEqual(dep.metadata, {
        integrity: {
          "1.5.0": "0df0f03a28f621111c667e3b50db97a24abf5c02"
        }
      });
      assert.deepEqual(dep.versions["1.5.0"], {
        attestations: undefined,
        deprecated: undefined,
        links: {
          npm: "https://www.npmjs.com/package/@slimio/is/v/1.5.0",
          homepage: "https://github.com/SlimIO/is#readme",
          repository: "https://github.com/SlimIO/is"
        }
      });
    });

    test("should enrich dependency with a valid NPM attestations (provenance)", async() => {
      const dep = {
        metadata: {
          integrity: {}
        },
        versions: {
          "3.1.0": {}
        }
      };
      const provider = new NpmRegistryProvider("@nodesecure/cli", "3.1.0");

      await provider.enrichDependencyVersion(dep as any, [], "nodesecure");
      assert.deepEqual(dep.versions["3.1.0"], {
        attestations: {
          provenance: {
            predicateType: "https://slsa.dev/provenance/v1"
          },
          url: "https://registry.npmjs.org/-/npm/v1/attestations/@nodesecure%2fcli@3.1.0"
        },
        deprecated: undefined,
        links: {
          homepage: "https://github.com/NodeSecure/cli#readme",
          npm: "https://www.npmjs.com/package/@nodesecure/cli/v/3.1.0",
          repository: "https://github.com/NodeSecure/cli"
        }
      });
    });

    test("should configure the npmApiClient on the given registry", async(t) => {
      const packumentVersionMock = t.mock.fn<(name: string, version: string) => Promise<PackumentVersion>>();
      const provider = new NpmRegistryProvider("foobarrxldkedeoxcjek", "1.5.0", {
        registry: "https://registry.npmjs.org/private",
        npmApiClient: {
          ...defaultNpmApiClient,
          packumentVersion: packumentVersionMock
        }
      });

      await provider.enrichDependencyVersion({} as any, [], null);
      assert.deepEqual(packumentVersionMock.mock.calls[0].arguments, ["foobarrxldkedeoxcjek", "1.5.0", {
        registry: "https://registry.npmjs.org/private"
      }]);
    });

    test(`should add a warning when a dependency is found on public and private registry
                  but the signatures does not match`, async(t) => {
      const packumentVersionMock = t.mock.fn<(name: string, version: string) => Promise<PackumentVersion>>();

      packumentVersionMock.mock.mockImplementationOnce(async() => ({
        dist: {
          signatures: [
            {
              keyid: "SHA256:jl3bwswu80PjjokCgh0o2w5c2U4LhQAE57gj9cz1kzA",
              sig: "MEUCIQCX/49atNeSDYZP8betYWEqB0G8zZnIyB7ibC7nRNyMiQIgHosOKHhVTVNBI/6iUNSpDokOc44zsZ7TfybMKj8YdfY="
            }
          ]
        }
      } as unknown as PackumentVersion));

      packumentVersionMock.mock.mockImplementation(async() => ({
        dist: {
          signatures: [
            {
              keyid: "SHA256:kl3bwswu80PjjokCgh0o2w5c2U4LhQAE57gj9cz1kzA",
              sig: "MEUCIQCX/49atNLSDYZP8betYWEqB0G8zZnIyB7ibC7nRNyMiQIgHosOKHhVTVNBI/6iUNSpDokOc44zsZ7TfybMKj8YdfY="
            }
          ]
        }
      } as unknown as PackumentVersion));

      const provider = new NpmRegistryProvider("foo", "1.5.0", {
        registry: "https://registry.npmjs.org/private",
        npmApiClient: {
          ...defaultNpmApiClient,
          packumentVersion: packumentVersionMock
        }
      });
      const warnings: DependencyConfusionWarning[] = [];
      const dep = {
        metadata: {
          integrity: {}
        },
        versions: {
          "1.5.0": {}
        }
      } as unknown as Dependency;
      await provider.enrichDependencyVersion(dep, warnings, null);
      assert.deepEqual(packumentVersionMock.mock.calls[0].arguments, ["foo", "1.5.0", {
        registry: "https://registry.npmjs.org/private"
      }]);
      assert.deepEqual(packumentVersionMock.mock.calls[1].arguments, ["foo", "1.5.0", {
        registry: getNpmRegistryURL()
      }]);
      assert.deepEqual(warnings, [{
        type: "dependency-confusion",
        message,
        metadata: {
          name: "foo"
        }
      }]);
    });

    test("should not add a warning when the signatures are the same but out of order", async(t) => {
      const packumentVersionMock = t.mock.fn<(name: string, version: string) => Promise<PackumentVersion>>();

      packumentVersionMock.mock.mockImplementationOnce(async() => ({
        dist: {
          signatures: [
            {
              keyid: "SHA256:jl3bwswu80PjjokCgh0o2w5c2U4LhQAE57gj9cz1kzB",
              sig: "MEUCIQCX/49atNeSDYZP8betYWEqB0G8zZnIyB7ibC7nRNyMiQIgHosOKHhVTVNBI/6iUNSpDokOc44zsZ7TfybMKj8YdfYB"
            },
            {
              keyid: "SHA256:jl3bwswu80PjjokCgh0o2w5c2U4LhQAE57gj9cz1kzA",
              sig: "MEUCIQCX/49atNeSDYZP8betYWEqB0G8zZnIyB7ibC7nRNyMiQIgHosOKHhVTVNBI/6iUNSpDokOc44zsZ7TfybMKj8YdfY="
            }
          ]
        }
      } as unknown as PackumentVersion));

      packumentVersionMock.mock.mockImplementation(async() => ({
        dist: {
          signatures: [
            {
              keyid: "SHA256:jl3bwswu80PjjokCgh0o2w5c2U4LhQAE57gj9cz1kzA",
              sig: "MEUCIQCX/49atNeSDYZP8betYWEqB0G8zZnIyB7ibC7nRNyMiQIgHosOKHhVTVNBI/6iUNSpDokOc44zsZ7TfybMKj8YdfY="
            },
            {
              keyid: "SHA256:jl3bwswu80PjjokCgh0o2w5c2U4LhQAE57gj9cz1kzB",
              sig: "MEUCIQCX/49atNeSDYZP8betYWEqB0G8zZnIyB7ibC7nRNyMiQIgHosOKHhVTVNBI/6iUNSpDokOc44zsZ7TfybMKj8YdfYB"
            }
          ]
        }
      } as unknown as PackumentVersion));

      const provider = new NpmRegistryProvider("foo", "1.5.0", {
        registry: "https://registry.npmjs.org/private",
        npmApiClient: {
          ...defaultNpmApiClient,
          packumentVersion: packumentVersionMock
        }
      });
      const warnings: DependencyConfusionWarning[] = [];
      const dep = {
        metadata: {
          integrity: {}
        },
        versions: {
          "1.5.0": {}
        }
      } as unknown as Dependency;
      await provider.enrichDependencyVersion(dep, warnings, null);
      assert.strictEqual(packumentVersionMock.mock.callCount(), 2);
      assert.deepEqual(packumentVersionMock.mock.calls[0].arguments, ["foo", "1.5.0", {
        registry: "https://registry.npmjs.org/private"
      }]);
      assert.deepEqual(packumentVersionMock.mock.calls[1].arguments, ["foo", "1.5.0", {
        registry: getNpmRegistryURL()
      }]);
      assert.deepEqual(warnings, []);
    });

    test("should add a warning when only the sig differ", async(t) => {
      const packumentVersionMock = t.mock.fn<(name: string, version: string) => Promise<PackumentVersion>>();

      packumentVersionMock.mock.mockImplementationOnce(async() => ({
        dist: {
          signatures: [
            {
              keyid: "SHA256:jl3bwswu80PjjokCgh0o2w5c2U4LhQAE57gj9cz1kzA",
              sig: "MEUCIQCX/49atNeSDYZP8betYWEqB0G8zZnIyB7ibC7nRNyMiQIgHosOKHhVTVNBI/6iUNSpDokOc44zsZ7TfybMKj8YdfY="
            }
          ]
        }
      } as unknown as PackumentVersion));

      packumentVersionMock.mock.mockImplementation(async() => ({
        dist: {
          signatures: [
            {
              keyid: "SHA256:jl3bwswu80PjjokCgh0o2w5c2U4LhQAE57gj9cz1kzA",
              sig: "MEUCIQCX/49atNLSDYZP8betYWEqB0G8zZnIyB7ibC7nRNyMiQIgHosOKHhVTVNBI/6iUNSpDokOc44zsZ7TfybMKj8YdfY="
            }
          ]
        }
      } as unknown as PackumentVersion));

      const provider = new NpmRegistryProvider("foo", "1.5.0", {
        registry: "https://registry.npmjs.org/private",
        npmApiClient: {
          ...defaultNpmApiClient,
          packumentVersion: packumentVersionMock
        }
      });
      const warnings: DependencyConfusionWarning[] = [];
      const dep = {
        metadata: {
          integrity: {}
        },
        versions: {
          "1.5.0": {}
        }
      } as unknown as Dependency;
      await provider.enrichDependencyVersion(dep, warnings, null);
      assert.deepEqual(packumentVersionMock.mock.calls[0].arguments, ["foo", "1.5.0", {
        registry: "https://registry.npmjs.org/private"
      }]);
      assert.deepEqual(packumentVersionMock.mock.calls[1].arguments, ["foo", "1.5.0", {
        registry: getNpmRegistryURL()
      }]);
      assert.strictEqual(packumentVersionMock.mock.callCount(), 2);
      assert.deepEqual(warnings, [{
        type: "dependency-confusion",
        message,
        metadata: {
          name: "foo"
        }
      }]);
    });

    test("should not call the public registry when the provider registry is also the public registry", async(t) => {
      const packumentVersionMock = t.mock.fn<(name: string, version: string) => Promise<PackumentVersion>>();

      packumentVersionMock.mock.mockImplementationOnce(async() => ({
        dist: {
          signatures: [
            {
              keyid: "SHA256:jl3bwswu80PjjokCgh0o2w5c2U4LhQAE57gj9cz1kzA",
              sig: "MEUCIQCX/49atNeSDYZP8betYWEqB0G8zZnIyB7ibC7nRNyMiQIgHosOKHhVTVNBI/6iUNSpDokOc44zsZ7TfybMKj8YdfY="
            }
          ]
        }
      } as unknown as PackumentVersion));
      const provider = new NpmRegistryProvider("foo", "1.5.0", {
        registry: getNpmRegistryURL(),
        npmApiClient: {
          ...defaultNpmApiClient,
          packumentVersion: packumentVersionMock
        }
      });

      const warnings: DependencyConfusionWarning[] = [];
      const dep = {
        metadata: {
          integrity: {}
        },
        versions: {
          "1.5.0": {}
        }
      } as unknown as Dependency;
      await provider.enrichDependencyVersion(dep, warnings, null);

      assert.strictEqual(packumentVersionMock.mock.callCount(), 1);
      assert.deepEqual(packumentVersionMock.mock.calls[0].arguments, ["foo", "1.5.0", {
        registry: getNpmRegistryURL()
      }]);
      assert.deepEqual(warnings, []);
    });

    test("should add a warning when private packument version has no version", async(t) => {
      const packumentVersionMock = t.mock.fn<(name: string, version: string) => Promise<PackumentVersion>>();

      packumentVersionMock.mock.mockImplementationOnce(async() => ({
        dist: {
          signatures: undefined
        }
      } as unknown as PackumentVersion));

      packumentVersionMock.mock.mockImplementation(async() => ({
        dist: {
          signatures: [
            {
              keyid: "SHA256:kl3bwswu80PjjokCgh0o2w5c2U4LhQAE57gj9cz1kzA",
              sig: "MEUCIQCX/49atNLSDYZP8betYWEqB0G8zZnIyB7ibC7nRNyMiQIgHosOKHhVTVNBI/6iUNSpDokOc44zsZ7TfybMKj8YdfY="
            }
          ]
        }
      } as unknown as PackumentVersion));

      const provider = new NpmRegistryProvider("foo", "1.5.0", {
        registry: "https://registry.npmjs.org/private",
        npmApiClient: {
          ...defaultNpmApiClient,
          packumentVersion: packumentVersionMock
        }
      });
      const warnings: DependencyConfusionWarning[] = [];
      const dep = {
        metadata: {
          integrity: {}
        },
        versions: {
          "1.5.0": {}
        }
      } as unknown as Dependency;
      await provider.enrichDependencyVersion(dep, warnings, null);
      assert.strictEqual(packumentVersionMock.mock.callCount(), 2);
      assert.deepEqual(packumentVersionMock.mock.calls[0].arguments, ["foo", "1.5.0", {
        registry: "https://registry.npmjs.org/private"
      }]);
      assert.deepEqual(packumentVersionMock.mock.calls[1].arguments, ["foo", "1.5.0", {
        registry: getNpmRegistryURL()
      }]);
      assert.deepEqual(warnings, [{
        type: "dependency-confusion",
        message,
        metadata: {
          name: "foo"
        }
      }]);
    });

    test("should add a warning when public packument signatures has no version", async(t) => {
      const packumentVersionMock = t.mock.fn<(name: string, version: string) => Promise<PackumentVersion>>();

      packumentVersionMock.mock.mockImplementationOnce(async() => ({
        dist: {
          signatures: [
            {
              keyid: "SHA256:kl3bwswu80PjjokCgh0o2w5c2U4LhQAE57gj9cz1kzA",
              sig: "MEUCIQCX/49atNLSDYZP8betYWEqB0G8zZnIyB7ibC7nRNyMiQIgHosOKHhVTVNBI/6iUNSpDokOc44zsZ7TfybMKj8YdfY="
            }
          ]
        }
      } as unknown as PackumentVersion));

      packumentVersionMock.mock.mockImplementation(async() => ({
        dist: {
          signatures: undefined
        }
      } as unknown as PackumentVersion));

      const provider = new NpmRegistryProvider("foo", "1.5.0", {
        registry: "https://registry.npmjs.org/private",
        npmApiClient: {
          ...defaultNpmApiClient,
          packumentVersion: packumentVersionMock
        }
      });
      const warnings: DependencyConfusionWarning[] = [];
      const dep = {
        metadata: {
          integrity: {}
        },
        versions: {
          "1.5.0": {}
        }
      } as unknown as Dependency;
      await provider.enrichDependencyVersion(dep, warnings, null);
      assert.strictEqual(packumentVersionMock.mock.callCount(), 2);
      assert.deepEqual(packumentVersionMock.mock.calls[0].arguments, ["foo", "1.5.0", {
        registry: "https://registry.npmjs.org/private"
      }]);
      assert.deepEqual(packumentVersionMock.mock.calls[1].arguments, ["foo", "1.5.0", {
        registry: getNpmRegistryURL()
      }]);
      assert.deepEqual(warnings, [{
        type: "dependency-confusion",
        message,
        metadata: {
          name: "foo"
        }
      }]);
    });

    test("should not add the warning when the two signatures are the same", async(t) => {
      const packumentVersionMock = t.mock.fn<(name: string, version: string) => Promise<PackumentVersion>>();

      packumentVersionMock.mock.mockImplementation(async() => ({
        dist: {
          signatures: [
            {
              keyid: "SHA256:kl3bwswu80PjjokCgh0o2w5c2U4LhQAE57gj9cz1kzA",
              sig: "MEUCIQCX/49atNLSDYZP8betYWEqB0G8zZnIyB7ibC7nRNyMiQIgHosOKHhVTVNBI/6iUNSpDokOc44zsZ7TfybMKj8YdfY="
            }
          ]
        }
      } as unknown as PackumentVersion));

      const provider = new NpmRegistryProvider("foo", "1.5.0", {
        registry: "https://registry.npmjs.org/private",
        npmApiClient: {
          ...defaultNpmApiClient,
          packumentVersion: packumentVersionMock
        }
      });
      const warnings: DependencyConfusionWarning[] = [];
      const dep = {
        metadata: {
          integrity: {}
        },
        versions: {
          "1.5.0": {}
        }
      } as unknown as Dependency;
      await provider.enrichDependencyVersion(dep, warnings, null);
      assert.strictEqual(packumentVersionMock.mock.callCount(), 2);
      assert.deepEqual(packumentVersionMock.mock.calls[0].arguments, ["foo", "1.5.0", {
        registry: "https://registry.npmjs.org/private"
      }]);
      assert.deepEqual(packumentVersionMock.mock.calls[1].arguments, ["foo", "1.5.0", {
        registry: getNpmRegistryURL()
      }]);
      assert.deepEqual(warnings, []);
    });

    test("should add a warning when the dependency is not scoped and not on the public npm package", async(t) => {
      const packumentVersionMock = t.mock.fn<(name: string, version: string) => Promise<PackumentVersion>>();

      packumentVersionMock.mock.mockImplementationOnce(async() => ({
        dist: {
          signatures: [
            {
              keyid: "SHA256:kl3bwswu80PjjokCgh0o2w5c2U4LhQAE57gj9cz1kzA",
              sig: "MEUCIQCX/49atNLSDYZP8betYWEqB0G8zZnIyB7ibC7nRNyMiQIgHosOKHhVTVNBI/6iUNSpDokOc44zsZ7TfybMKj8YdfY="
            }
          ]
        }
      } as unknown as PackumentVersion));

      packumentVersionMock.mock.mockImplementation(async() => {
        throw new HttpieOnHttpError({
          data: null,
          headers: {},
          statusMessage: "Not found",
          statusCode: 404
        });
      });

      const provider = new NpmRegistryProvider("foo", "1.5.0", {
        registry: "https://registry.npmjs.org/private",
        npmApiClient: {
          ...defaultNpmApiClient,
          packumentVersion: packumentVersionMock
        }
      });
      const warnings: DependencyConfusionWarning[] = [];
      const dep = {
        metadata: {
          integrity: {}
        },
        versions: {
          "1.5.0": {}
        }
      } as unknown as Dependency;
      await provider.enrichDependencyVersion(dep, warnings, null);
      assert.strictEqual(packumentVersionMock.mock.callCount(), 2);
      assert.deepEqual(packumentVersionMock.mock.calls[0].arguments, ["foo", "1.5.0", {
        registry: "https://registry.npmjs.org/private"
      }]);
      assert.deepEqual(packumentVersionMock.mock.calls[1].arguments, ["foo", "1.5.0", {
        registry: getNpmRegistryURL()
      }]);
      assert.deepEqual(warnings, [{
        type: "dependency-confusion",
        message: messageMissing,
        metadata: {
          name: "foo"
        }
      }]);
    });

    test("should not add a warning when the error is not a 404", async(t) => {
      const packumentVersionMock = t.mock.fn<(name: string, version: string) => Promise<PackumentVersion>>();

      packumentVersionMock.mock.mockImplementationOnce(async() => ({
        dist: {
          signatures: [
            {
              keyid: "SHA256:kl3bwswu80PjjokCgh0o2w5c2U4LhQAE57gj9cz1kzA",
              sig: "MEUCIQCX/49atNLSDYZP8betYWEqB0G8zZnIyB7ibC7nRNyMiQIgHosOKHhVTVNBI/6iUNSpDokOc44zsZ7TfybMKj8YdfY="
            }
          ]
        }
      } as unknown as PackumentVersion));

      packumentVersionMock.mock.mockImplementation(async() => {
        throw new HttpieOnHttpError({
          data: null,
          headers: {},
          statusMessage: "Internal server error",
          statusCode: 500
        });
      });

      const provider = new NpmRegistryProvider("foo", "1.5.0", {
        registry: "https://registry.npmjs.org/private",
        npmApiClient: {
          ...defaultNpmApiClient,
          packumentVersion: packumentVersionMock
        }
      });
      const warnings: DependencyConfusionWarning[] = [];
      const dep = {
        metadata: {
          integrity: {}
        },
        versions: {
          "1.5.0": {}
        }
      } as unknown as Dependency;
      await provider.enrichDependencyVersion(dep, warnings, null);
      assert.strictEqual(packumentVersionMock.mock.callCount(), 2);
      assert.deepEqual(packumentVersionMock.mock.calls[0].arguments, ["foo", "1.5.0", {
        registry: "https://registry.npmjs.org/private"
      }]);
      assert.deepEqual(packumentVersionMock.mock.calls[1].arguments, ["foo", "1.5.0", {
        registry: getNpmRegistryURL()
      }]);
      assert.deepEqual(warnings, []);
    });

    test("should not add a warning when the dependency is a scoped and not on the public npm package", async(t) => {
      const packumentVersionMock = t.mock.fn<(name: string, version: string) => Promise<PackumentVersion>>();

      packumentVersionMock.mock.mockImplementationOnce(async() => ({
        dist: {
          signatures: [
            {
              keyid: "SHA256:kl3bwswu80PjjokCgh0o2w5c2U4LhQAE57gj9cz1kzA",
              sig: "MEUCIQCX/49atNLSDYZP8betYWEqB0G8zZnIyB7ibC7nRNyMiQIgHosOKHhVTVNBI/6iUNSpDokOc44zsZ7TfybMKj8YdfY="
            }
          ]
        }
      } as unknown as PackumentVersion));

      packumentVersionMock.mock.mockImplementation(async() => {
        throw new HttpieOnHttpError({
          data: null,
          headers: {},
          statusMessage: "Not found",
          statusCode: 404
        });
      });

      const provider = new NpmRegistryProvider("@foo/utils", "1.5.0", {
        registry: "https://registry.npmjs.org/private",
        npmApiClient: {
          ...defaultNpmApiClient,
          packumentVersion: packumentVersionMock
        }
      });
      const warnings: DependencyConfusionWarning[] = [];
      const dep = {
        metadata: {
          integrity: {}
        },
        versions: {
          "1.5.0": {}
        }
      } as unknown as Dependency;
      await provider.enrichDependencyVersion(dep, warnings, "foo");
      assert.strictEqual(packumentVersionMock.mock.callCount(), 2);
      assert.deepEqual(packumentVersionMock.mock.calls[0].arguments, ["@foo/utils", "1.5.0", {
        registry: "https://registry.npmjs.org/private"
      }]);
      assert.deepEqual(packumentVersionMock.mock.calls[1].arguments, ["@foo/utils", "1.5.0", {
        registry: getNpmRegistryURL()
      }]);
      assert.deepEqual(warnings, []);
    });
  });

  describe("enrichDependency", () => {
    test("should not throw error when package does not exist", async() => {
      const logger = new Logger().start("registry");
      const provider = new NpmRegistryProvider("foobarrxldkedeoxcjek", "1.5.0");

      const warnings: DependencyConfusionWarning[] = [];

      await provider.enrichDependency(logger, {} as any);
      assert.deepEqual(warnings, []);
    });

    test("should configure the npmApiClient on the given registry", async(t) => {
      const logger = new Logger().start("registry");

      const packumentMock = t.mock.fn<(name: string) => Promise<Packument>>();
      const provider = new NpmRegistryProvider("foobarrxldkedeoxcjek", "1.5.0", {
        registry: "https://registry.npmjs.org/private",
        npmApiClient: {
          ...defaultNpmApiClient,
          packument: packumentMock
        }
      });

      await provider.enrichDependency(logger, {} as any);

      assert.deepEqual(packumentMock.mock.calls[0].arguments, [
        "foobarrxldkedeoxcjek",
        {
          registry: "https://registry.npmjs.org/private"
        }
      ]);
    });

    test("should enrich dependency with complete package metadata for valid package", async() => {
      const dependency = {
        metadata: {},
        versions: {
          "1.5.0": {
            flags: []
          }
        }
      } as unknown as Dependency;
      const logger = new Logger().start("registry");
      const provider = new NpmRegistryProvider("@slimio/is", "1.5.0");

      await provider.enrichDependency(logger, dependency);

      assert.deepEqual(dependency.versions["1.5.0"]!.flags, ["isOutdated"]);
      assert.strictEqual(logger.count("registry"), 1);
      assert.strictEqual(dependency.metadata.author!.name, "SlimIO");
      assert.strictEqual(dependency.metadata.homepage, "https://github.com/SlimIO/is#readme");
      assert.ok(semver.gt(dependency.metadata.lastVersion, "1.5.0"));
      assert.ok(Array.isArray(dependency.metadata.publishers));
      assert.ok(Array.isArray(dependency.metadata.maintainers));
      assert.ok(dependency.metadata.publishers.length > 0);
      assert.ok(dependency.metadata.maintainers.length > 0);
      assert.ok(dependency.metadata.hasManyPublishers);
      assert.ok(typeof dependency.metadata.publishedCount === "number");
      assert.ok(is.date(new Date(dependency.metadata.lastUpdateAt)));
      assert.deepEqual(dependency.versions["1.5.0"]!.links, {
        npm: "https://www.npmjs.com/package/@slimio/is/v/1.5.0",
        homepage: "https://github.com/SlimIO/is#readme",
        repository: "https://github.com/SlimIO/is"
      });
    });

    test("should extract GitLab repository links when package is hosted on GitLab", async() => {
      const dependency = {
        metadata: {},
        versions: {
          "71.2.0": {
            flags: []
          }
        }
      } as unknown as Dependency;
      const logger = new Logger().start("registry");
      const provider = new NpmRegistryProvider("@gitlab/ui", "71.2.0");

      await provider.enrichDependency(logger, dependency);

      assert.deepEqual(dependency.versions["71.2.0"]!.links, {
        npm: "https://www.npmjs.com/package/@gitlab/ui/v/71.2.0",
        homepage: "https://gitlab.com/gitlab-org/gitlab-ui#readme",
        repository: "https://gitlab.com/gitlab-org/gitlab-ui"
      });
    });

    test("should detect and flag deprecated package versions", async() => {
      const dependency = {
        metadata: {},
        versions: {
          "2.5.9": {
            flags: []
          }
        }
      } as unknown as Dependency;
      const logger = new Logger().start("registry");
      const provider = new NpmRegistryProvider("express", "2.5.9");

      await provider.enrichDependency(logger, dependency);

      assert.deepEqual(dependency.versions["2.5.9"]!.flags, [
        "isOutdated",
        "isDeprecated"
      ]);

      assert.strictEqual(dependency.versions["2.5.9"].deprecated, "express 2.x series is deprecated");
    });
  });

  describe("enrichDependencyConfusionWarnings", async() => {
    const message = "The org 'foo' is not claimed on the public registry";

    const privateRegistry = "https://registry.npmjs.org/private";

    test("should add a warning when the org is not found on the public npm registry", async(t) => {
      const mockOrg = t.mock.fn(dummyThrow);
      const provider = new NpmRegistryProvider("@foo/utils", "2.5.9", {
        npmApiClient: {
          ...defaultNpmApiClient,
          org: mockOrg
        },
        registry: privateRegistry
      });
      const warnings: DependencyConfusionWarning[] = [];
      await provider.enrichScopedDependencyConfusionWarnings(warnings, "foo");
      assert.deepEqual(warnings, [{
        type: "dependency-confusion",
        message,
        metadata: {
          name: "@foo/utils"
        }
      }]);
      assert.strictEqual(mockOrg.mock.callCount(), 1);
    });
    test("should not add a warning when the error is not a 404", async(t) => {
      const mockOrg = t.mock.fn(() => {
        throw new HttpieOnHttpError({
          data: null,
          headers: {},
          statusMessage: "Internal server error",
          statusCode: 500
        });
      });
      const provider = new NpmRegistryProvider("@foo/utils", "2.5.9", {
        npmApiClient: {
          ...defaultNpmApiClient,
          org: mockOrg
        },
        registry: privateRegistry
      });
      const warnings: DependencyConfusionWarning[] = [];
      await provider.enrichScopedDependencyConfusionWarnings(warnings, "foo");
      assert.deepEqual(warnings, []);
      assert.strictEqual(mockOrg.mock.callCount(), 1);
    });
    test("should not not add a dependency confusion warning when the org exist on the public registry", async(t) => {
      const mockOrg = t.mock.fn(async(_) => {
        return {};
      });
      const provider = new NpmRegistryProvider("@foo/utils", "2.5.9", {
        npmApiClient: {
          ...defaultNpmApiClient,
          org: mockOrg
        },
        registry: privateRegistry
      });
      const warnings: DependencyConfusionWarning[] = [];
      await provider.enrichScopedDependencyConfusionWarnings(warnings, "foo");
      assert.deepEqual(warnings, []);
      assert.strictEqual(mockOrg.mock.callCount(), 1);
      assert.deepEqual(mockOrg.mock.calls[0].arguments, ["@foo/utils"]);
    });
  });
});
