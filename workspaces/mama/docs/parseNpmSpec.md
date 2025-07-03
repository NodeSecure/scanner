# parseNpmSpec

Parse a raw NPM package specifier string (e.g. `"foo@1.2.3"` or `"@scope/foo@latest"`) into its structured components: organization, name, version, and full input spec.

## Function Signature

```ts
export interface PackageSpec {
  org: string | null;
  name: string;
  semver: string | null;
  spec: string;
}

function parseNpmSpec(spec: string): PackageSpec | null;
```

## Example Usage

```ts
parseNpmSpec("lodash@^4.17.0");
// {
//   org: null,
//   name: "lodash",
//   semver: "^4.17.0",
//   spec: "lodash@^4.17.0"
// }

parseNpmSpec("@nestjs/core@8.0.0");
// {
//   org: "nestjs",
//   name: "@nestjs/core",
//   semver: "8.0.0",
//   spec: "@nestjs/core@8.0.0"
// }

parseNpmSpec("invalid string");
// null
```

## How It Works

The function uses a regular expression:

```ts
/^(?:@([^/]+)\/)?.+?(?:@(.+))?$/
```

to extract:

* **org** → the optional scope/organization (e.g. `"@my-org"` → `"my-org"`)
* **semver** → the optional version/tag/range (e.g. `"@1.0.0"` → `"1.0.0"`)
* **name** → the actual package name, derived by stripping version if present
* **spec** → the original input string (preserved for reference)

If the input string does not match the expected structure, the function returns `null`.
