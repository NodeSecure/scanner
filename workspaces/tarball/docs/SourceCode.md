# SourceCode APIs

## SourceCodeScanner

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

The `iterate` method can take either entries files (from package.json) or a list of JavaScript files

```ts
export interface SourceCodeEntries {
  /**
   * Source files from package.json
   */
  manifest: string[];
  /**
   * All JavaScript source files from tarball
   */
  javascript: string[];
}
```

If there is no manifest files provided then the class will iterate on all JavaScript files.

## SourceCodeReport class
