// Import Node.js Dependencies
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, test } from "node:test";
import assert from "node:assert";

// Import Third-party Dependencies
import { CollectableSet, warnings, type Warning } from "@nodesecure/js-x-ray";
import { ManifestManager } from "@nodesecure/mama";

type SourceArrayLocation = [[number, number], [number, number]];

// Import Internal Dependencies
import { NpmTarball } from "../src/class/NpmTarball.class.ts";

// CONSTANTS
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const kFixturePath = path.join(__dirname, "fixtures", "npmTarball");
const kShadyLinkPath = path.join(kFixturePath, "shady-link");

describe("NpmTarball", () => {
  test("it should have a shady-link warning when a hostname resolve a private ip address with collectables", async() => {
    const mama = await ManifestManager.fromPackageJSON(path.join(kFixturePath, "shady-link", "package.json"));
    const npmTarball = new NpmTarball(mama);
    const hostnameSet = new CollectableSet("hostname");

    const result = await npmTarball.scanFiles({
      collectables: [hostnameSet]
    });

    assert.deepEqual(
      result.code.warnings.sort(compareWarning),
      [{
        ...warnings["shady-link"],
        kind: "shady-link",
        location: [[[1, 18], [1, 50]]] as SourceArrayLocation[],
        source: "Scanner",
        value: "10.0.0.1.sslip.io",
        file: `${kShadyLinkPath}/private-ip-1`
      },
      {
        ...warnings["shady-link"],
        kind: "shady-link",
        location: [[[3, 19], [3, 51]]] as SourceArrayLocation[],
        source: "Scanner",
        value: "10.0.0.1.sslip.io",
        file: `${kShadyLinkPath}/private-ip-2`
      },
      {
        ...warnings["shady-link"],
        kind: "shady-link",
        location: [[[1, 18], [1, 50]]] as SourceArrayLocation[],
        source: "Scanner",
        file: `${kShadyLinkPath}/private-ip-2`,
        value: "192-168-1-250.sslip.io"
      }].sort(compareWarning)
    );
  });

  test("it should have a shady-link warning when a hostname resolve a private ip address without options", async() => {
    const mama = await ManifestManager.fromPackageJSON(path.join(kFixturePath, "shady-link", "package.json"));
    const npmTarball = new NpmTarball(mama);

    const result = await npmTarball.scanFiles();

    assert.deepEqual(
      result.code.warnings.sort(compareWarning),
      [{
        ...warnings["shady-link"],
        kind: "shady-link",
        location: [[[1, 18], [1, 50]]] as SourceArrayLocation[],
        source: "Scanner",
        value: "10.0.0.1.sslip.io",
        file: `${kShadyLinkPath}/private-ip-1`
      },
      {
        ...warnings["shady-link"],
        kind: "shady-link",
        location: [[[3, 19], [3, 51]]] as SourceArrayLocation[],
        source: "Scanner",
        value: "10.0.0.1.sslip.io",
        file: `${kShadyLinkPath}/private-ip-2`
      },
      {
        ...warnings["shady-link"],
        kind: "shady-link",
        location: [[[1, 18], [1, 50]]] as SourceArrayLocation[],
        source: "Scanner",
        file: `${kShadyLinkPath}/private-ip-2`,
        value: "192-168-1-250.sslip.io"
      }].sort(compareWarning)
    );
  });

  test("it should have a shady-link warning when a hostname resolve a private ip address without hostname set", async() => {
    const mama = await ManifestManager.fromPackageJSON(path.join(kFixturePath, "shady-link", "package.json"));
    const npmTarball = new NpmTarball(mama);

    const result = await npmTarball.scanFiles({
      collectables: [new CollectableSet("url"), new CollectableSet("ip")]
    });

    assert.deepEqual(
      result.code.warnings.sort(compareWarning),
      [{
        ...warnings["shady-link"],
        kind: "shady-link",
        location: [[[1, 18], [1, 50]]] as SourceArrayLocation[],
        source: "Scanner",
        value: "10.0.0.1.sslip.io",
        file: `${kShadyLinkPath}/private-ip-1`
      },
      {
        ...warnings["shady-link"],
        kind: "shady-link",
        location: [[[3, 19], [3, 51]]] as SourceArrayLocation[],
        source: "Scanner",
        value: "10.0.0.1.sslip.io",
        file: `${kShadyLinkPath}/private-ip-2`
      },
      {
        ...warnings["shady-link"],
        kind: "shady-link",
        location: [[[1, 18], [1, 50]]] as SourceArrayLocation[],
        source: "Scanner",
        file: `${kShadyLinkPath}/private-ip-2`,
        value: "192-168-1-250.sslip.io"
      }].sort(compareWarning)
    );
  });
});

function compareWarning(a: Warning, b: Warning): number {
  const fileComparison = a.file?.localeCompare(b.file ?? "");

  if (fileComparison) {
    return fileComparison;
  }

  return (a.value ?? "")?.localeCompare(b.value ?? "");
}
