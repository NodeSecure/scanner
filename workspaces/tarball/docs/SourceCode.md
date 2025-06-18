# SourceCode APIs

The **SourceCode** APIs are designed to extract, collect, and analyze information from JavaScript source files—either from a **package.json** manifest or a tarball archive. These utilities are built on top of `@nodesecure/js-x-ray` and `@nodesecure/mama` to provide a unified interface for static analysis.

## SourceCodeScanner

The **SourceCodeScanner** is responsible for orchestrating the analysis of JavaScript files and aggregating results into a report.

```ts
const mama = await ManifestManager.fromPackageJSON(
  location
);

const scanner = new SourceCodeScanner(mama);

const report = await scanner.iterate({
  manifest: ["./index.js"],
  javascript: ["./index.js", "./test/foobar.js"]
});
console.log(report);
```

### Method: `iterate(entries: SourceCodeEntries): Promise<T>`

The `iterate` method accepts an object of type `SourceCodeEntries`, which defines the source files to analyze:

```ts
export interface SourceCodeEntries {
  /**
   * Source files declared in package.json (e.g. "main", "exports", etc.)
   */
  manifest: string[];

  /**
   * All JavaScript source files extracted from the package tarball
   */
  javascript: string[];
}
```

* If `manifest` is non-empty, the scanner will prioritize those files.
* If `manifest` is empty, it will fall back to analyzing all JavaScript files.

### Constructor

```ts
new SourceCodeScanner(manifest: LocatedManifestManager, options?: SourceCodeScannerOptions<T>)
```

Optional `options.reportInitiator` allows you to customize the report type (default is `SourceCodeReport`).

---

## SourceCodeAggregator

This interface defines the minimal structure required for an object to act as a source code report.

```ts
export interface SourceCodeAggregator {
  readonly consumed: boolean;

  push(report: ReportOnFile & { file: string; }): void;
}
```

- `consumed`: A flag indicating whether at least one report was successfully pushed.
- `push(report)`: Method used by the scanner to add a parsed file report to the aggregator.

You can provide your own implementation of SourceCodeAggregator by passing a custom reportInitiator to the scanner:

```ts
class MyCustomAggregator implements SourceCodeAggregator {
  // Code here
}

new SourceCodeScanner(mama, {
  reportInitiator() {
    return new MyCustomAggregator();
  }
});
```

## SourceCodeReport class

Default implementation of `SourceCodeAggregator`, returned when **no custom report is provided**.

### Properties

* `warnings: Warning[]`
  List of warnings from all analyzed files, each enriched with the file name.

* `dependencies: Record<string, Record<string, Dependency>>`
  Map of dependencies found in each file, organized by file name.

* `minified: string[]`
  List of files detected as minified.

* `flags: { hasExternalCapacity: boolean }`
  Indicates whether any file used external capabilities (like `fetch`).

* `consumed: boolean`
  Whether any file was successfully analyzed and added to the report.

### Method: `groupAndAnalyseDependencies(mama: ManifestManager): {...}`

Groups and analyzes the collected dependencies to identify various dependency types:

```ts
{
  files: Set<string>,
  dependenciesInTryBlock: string[],
  dependencies: {
    nodejs: string[],
    subpathImports: string[],
    thirdparty: string[],
    missing: string[],
    unused: string[]
  },
  flags: {
    // Additional flags such as presence of deep imports, optional deps, etc.
  }
}
```
