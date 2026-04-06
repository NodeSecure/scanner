// Import Node.js Dependencies
import path from "node:path";
import assert from "node:assert";
import { describe, test } from "node:test";

// Import Third-party Dependencies
import {
  ManifestManager
} from "@nodesecure/mama";
import {
  type ReportOnFile,
  AstAnalyser,
  DefaultCollectableSet
} from "@nodesecure/js-x-ray";

// Import Internal Dependencies
import { DependencyCollectableSet } from "../src/index.ts";
import {
  SourceCodeScanner,
  type SourceCodeAggregator
} from "../src/class/SourceCodeScanner.class.ts";

// CONSTANTS
const kFixturePath = path.join(import.meta.dirname, "fixtures", "scanPackage");

describe("SourceCodeScanner", () => {
  test("iterate() should return empty report if we provide no files", async() => {
    const mama = loadFixtureManifest("entryfiles");
    const scanner = new SourceCodeScanner(mama);

    const report = await scanner.iterate({ manifest: [], javascript: [] });
    assert.strictEqual(report.consumed, false);
    assert.strictEqual(report.path, "NONE");
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
        path.join("src", "index.js"),
        path.join("src", "foo.js")
      ].sort()

    );

    assert.strictEqual(aggregator.path, "EntryFileAnalyser");
  });

  test("should have a path of Both when we have entries + js files", async() => {
    const mama = loadFixtureManifest("entryfiles");
    const aggregator = createAggregator(false);

    const scanner = new SourceCodeScanner(mama, {
      reportInitiator: () => aggregator
    });
    await scanner.iterate({
      manifest: [
        "src/index.js"
      ],
      javascript: [
        "src/alone.js"
      ]
    });

    const { reports } = aggregator;

    const files = reports
      .map((report) => path.normalize(report.file))
      .sort();

    assert.deepEqual(
      files,
      [
        path.join("src", "index.js"),
        path.join("src", "foo.js"),
        path.join("src", "alone.js")
      ].sort()

    );

    assert.strictEqual(aggregator.path, "Both");
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

    const { reports, path: aggregatorPath } = aggregator;

    const files = reports
      .map((report) => path.normalize(report.file))
      .sort();

    assert.deepEqual(
      files,
      [
        "index.js",
        path.join("src", "deps.js")
      ].sort()
    );

    assert.strictEqual(aggregatorPath, "All");
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

  test("it should add spec to collectables", async() => {
    const mama = loadFixtureManifest("entryfiles");
    const emailSet = new DefaultCollectableSet<{ spec?: string; }>("email");

    const scanner = new SourceCodeScanner(mama, {
      astAnalyser: new AstAnalyser({
        collectables: [
          emailSet,
          new DefaultCollectableSet("dependency")
        ]
      })
    });
    await scanner.iterate({
      manifest: [
        "src/index.js"
      ],
      javascript: []
    });

    assert.deepEqual(Array.from(emailSet)[0].locations[0].metadata?.spec, "foobar@1.0.0");
  });

  test("iterate() should report typescript files", async() => {
    const mama = loadFixtureManifest("tsOnly");
    const depsSet = new DependencyCollectableSet(mama);
    const astAnalyser = new AstAnalyser({
      collectables: [depsSet]
    });
    const aggregator = createAggregator();

    const scanner = new SourceCodeScanner(mama, {
      reportInitiator: () => aggregator,
      astAnalyser
    });
    await scanner.iterate({
      manifest: [
        "src/index.ts"
      ],
      javascript: []
    });

    const { reports } = aggregator;

    const firstReport = reports[0];
    if (firstReport.ok) {
      const { files, dependencies } = depsSet.extract();
      assert.ok(dependencies.nodeJs.includes("node:http"));

      const normalizedFiles = Array.from(files)
        .map((file) => path.normalize(file));
      assert.ok(normalizedFiles.includes(path.join("src", "bar.ts")));
    }
    else {
      assert.fail("First report should be ok");
    }

    const files = reports
      .map((report) => path.normalize(report.file))
      .sort();

    assert.deepEqual(
      files,
      [
        path.join("src", "index.ts"),
        path.join("src", "bar.ts")
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
    path: "NONE",
    consumed,
    push(report) {
      this.reports.push(report);
    }
  };
}
