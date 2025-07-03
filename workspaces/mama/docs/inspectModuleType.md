# inspectModuleType

Detect the module system used by a given NPM package (`CommonJS`, `ESM`, both, or other variants), based on its manifest (`package.json`).

## Function Signature

```ts
export type PackageModuleType = "dts" | "faux" | "dual" | "esm" | "cjs";

function inspectModuleType(
  packageJson: PackageJSON | WorkspacesPackageJSON | PackumentVersion
): PackageModuleType;
```

## Return Types

| Value    | Meaning                                                           |
| -------- | ----------------------------------------------------------------- |
| `"esm"`  | True ESM (via `"type": "module"`, `.mjs`, or conditional exports) |
| `"cjs"`  | CommonJS only (default Node.js behavior or no ESM signals)        |
| `"dual"` | Supports both ESM and CJS explicitly                              |
| `"faux"` | Declares a `module` field but lacks real ESM structure            |
| `"dts"`  | Type-only package (e.g. `@types/*`) or no executable entry point  |

## Example Usage

```ts
inspectModuleType({
  name: "my-lib",
  type: "module",
  main: "./index.js"
});
// → "esm"

inspectModuleType({
  name: "@types/node",
  types: "index.d.ts"
});
// → "dts"

inspectModuleType({
  name: "legacy-package",
  main: "index.js"
});
// → "cjs"

inspectModuleType({
  name: "dual-package",
  type: "module",
  exports: {
    require: "./cjs/index.cjs",
    import: "./esm/index.mjs"
  }
});
// → "dual"
```

## How It Works

The function uses the following rules to infer module type:

1. **Type-only packages**

   * If the package is under `@types/` or has no `main`/`exports`, but defines `types`, it's marked as `"dts"`.

2. **Faux ESM**

   * If a `module` field exists (but not backed by real ESM logic), returns `"faux"`.

3. **Dual packages**

   * If both `require` and `import` are present in `exports`, or `.cjs` and `.mjs` coexist.

4. **Pure ESM or CJS**

   * Based on the `"type"` field, `main` file extensions, and conditional exports.

5. **Fallback**

   * Defaults to `"cjs"` if no indicators are found.

Nested conditions inside the `exports` map are recursively analyzed to detect mixed usage.

