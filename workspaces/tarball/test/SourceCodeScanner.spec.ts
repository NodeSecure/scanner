// Import Node.js Dependencies
import path from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert";
import { describe, test } from "node:test";

// Import Third-party Dependencies
import {
  ManifestManager
} from "@nodesecure/mama";
import type { ReportOnFile } from "@nodesecure/js-x-ray";

// Import Internal Dependencies
import {
  SourceCodeScanner,
  type SourceCodeAggregator
} from "../src/class/SourceCodeScanner.class.js";

// CONSTANTS
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const kFixturePath = path.join(__dirname, "fixtures", "scanPackage");

describe("SourceCodeScanner", () => {
  test("iterate() should throw if we provide no files", async() => {
    const mama = loadFixtureManifest("entryfiles");
    const scanner = new SourceCodeScanner(mama);

    await assert.rejects(
      () => scanner.iterate({ manifest: [], javascript: [] }),
      { message: "You must provide at least one file either in manifest or javascript" }
    );
  });

  test("iterate() should throw if we provide a manifest that doesn't exist and zero JavaScript files", async() => {
    const mama = loadFixtureManifest("entryfiles");
    const scanner = new SourceCodeScanner(mama);

    await assert.rejects(
      () => scanner.iterate({
        manifest: [
          "src/bar.js"
        ],
        javascript: []
      }),
      { message: "You must provide at least one javascript source file" }
    );
  });

  test("iterate() should properly trace and report required files using one manifest entry file", async() => {
    const mama = loadFixtureManifest("entryfiles");
    const aggregator = createAggregator();

    const scanner = new SourceCodeScanner(mama, {
      reportInitiator: () => aggregator
    });
    await scanner.iterate({
      manifest: [
        "src/index.js"
      ],
      javascript: []
    });

    const { reports } = aggregator;

    const files = reports
      .map((report) => path.normalize(report.file))
      .sort();

    assert.deepEqual(
      files,
      [
        "src\\index.js",
        "src\\foo.js"
      ].sort()
    );
  });

  test("iterate() should trace and report only provided JavaScript files", async() => {
    const mama = loadFixtureManifest("caseone");
    const aggregator = createAggregator();

    const scanner = new SourceCodeScanner(mama, {
      reportInitiator: () => aggregator
    });
    await scanner.iterate({
      manifest: [],
      javascript: [
        "index.js",
        "src/deps.js"
      ]
    });

    const { reports } = aggregator;

    const files = reports
      .map((report) => path.normalize(report.file))
      .sort();

    assert.deepEqual(
      files,
      [
        "index.js",
        "src\\deps.js"
      ].sort()
    );
  });
});

function loadFixtureManifest(
  location: string
) {
  const mama = ManifestManager.fromPackageJSONSync(
    path.join(kFixturePath, location)
  );
  if (!ManifestManager.isLocated(mama)) {
    throw new Error("manifest must be located");
  }

  return mama;
}

type CustomAggregator = SourceCodeAggregator & {
  reports: (ReportOnFile & { file: string; })[];
};

function createAggregator(
  consumed = true
): CustomAggregator {
  return {
    reports: [],

    consumed,
    push(report) {
      this.reports.push(report);
    }
  };
}
