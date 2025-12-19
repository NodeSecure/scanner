// Import Node.js Dependencies
import path from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert";
import { describe, test } from "node:test";

// Import Third-party Dependencies
import {
  ManifestManager
} from "@nodesecure/mama";
import { type ReportOnFile, AstAnalyser } from "@nodesecure/js-x-ray";

// Import Internal Dependencies
import {
  SourceCodeScanner,
  type SourceCodeAggregator
} from "../src/class/SourceCodeScanner.class.ts";

// CONSTANTS
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const kFixturePath = path.join(__dirname, "fixtures", "scanPackage");

describe("SourceCodeScanner", () => {
  test("iterate() should return empty report if we provide no files", async() => {
    const mama = loadFixtureManifest("entryfiles");
    const scanner = new SourceCodeScanner(mama);

    const report = await scanner.iterate({ manifest: [], javascript: [] });
    assert.strictEqual(report.consumed, false);
  });

  test("iterate() should return empty report if we provide a manifest that doesn't exist and zero JavaScript files", async() => {
    const mama = loadFixtureManifest("entryfiles");
    const scanner = new SourceCodeScanner(mama);

    const report = await scanner.iterate({
      manifest: [
        "src/bar.js"
      ],
      javascript: []
    });
    assert.strictEqual(report.consumed, false);
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

  test("iterate() should report optional warning for synchronous I/O", async() => {
    const mama = loadFixtureManifest("synchronous-io");
    const astAnalyser = new AstAnalyser({
      optionalWarnings: true
    });
    const aggregator = createAggregator();

    const scanner = new SourceCodeScanner(mama, {
      reportInitiator: () => aggregator,
      astAnalyser
    });
    await scanner.iterate({
      manifest: [],
      javascript: [
        "index.js"
      ]
    });

    const { reports } = aggregator;

    assert.strictEqual(reports.length, 1);
    const { warnings } = reports[0];
    assert.partialDeepStrictEqual(warnings,
      [
        {
          kind: "synchronous-io",
          source: "JS-X-Ray",
          i18n: "sast_warnings.synchronous_io",
          severity: "Warning",
          experimental: true,
          value: "appendFileSync"
        }
      ]
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
