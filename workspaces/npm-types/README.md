<p align="center"><h1 align="center">
  @nodesecure/npm-types
</h1>

<p align="center">
  Up to date typescript definitions for npm registry content
</p>

## Requirements
- [Node.js](https://nodejs.org/en/) v24 or higher

## Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i @nodesecure/npm-types -D
# or
$ yarn add @nodesecure/npm-types -D
```

## Usage example

```ts
import type { PackageJSON } from "@nodesecure/npm-types";
```

## 📚 Types Documentation

### Core Package Types

#### `PackageJSON`
Represents a standard `package.json` file with all npm-supported fields.

```ts
import type { PackageJSON } from "@nodesecure/npm-types";

const pkg: PackageJSON = {
  name: "my-package",
  version: "1.0.0",
  dependencies: { ... }
};
```

#### `WorkspacesPackageJSON`
Extends `PackageJSON` for monorepo workspace configurations. Name and version are optional.

```ts
import type { WorkspacesPackageJSON } from "@nodesecure/npm-types";

const workspace: WorkspacesPackageJSON = {
  workspaces: ["packages/*"]
};
```

### Registry Metadata Types

#### `Packument`
Complete package metadata as returned by the npm registry. Contains all versions, maintainers, and distribution information.

```ts
import type { Packument } from "@nodesecure/npm-types";

const packument: Packument = {
  _id: "my-package",
  name: "my-package",
  "dist-tags": { latest: "1.0.0" },
  versions: { ... },
  time: { ... }
};
```

#### `PackumentVersion`
Metadata for a specific package version within a packument. Includes distribution details, maintainers, and npm-specific fields.

```ts
import type { PackumentVersion } from "@nodesecure/npm-types";

const version: PackumentVersion = {
  name: "my-package",
  version: "1.0.0",
  dist: {
    tarball: "https://...",
    shasum: "...",
    integrity: "sha512-..."
  },
  _npmUser: { name: "username" }
};
```

#### `Manifest`
Abbreviated package metadata format (corgi format). Lighter alternative to `Packument` for install operations.

```ts
import type { Manifest } from "@nodesecure/npm-types";
```

### Utility Types

#### `Contact`
Represents a person (author, contributor, maintainer).

```ts
import type { Contact } from "@nodesecure/npm-types";

const author: Contact = {
  name: "John Doe",
  email: "john@example.com",
  url: "https://johndoe.com"
};
```

#### `Repository`
Git repository information.

```ts
import type { Repository } from "@nodesecure/npm-types";

const repo: Repository = {
  type: "git",
  url: "https://github.com/user/repo.git",
  directory: "packages/core"
};
```

#### `Dist`
Distribution information for a package version (tarball location, integrity hashes, signatures).

```ts
import type { Dist } from "@nodesecure/npm-types";
```

#### `DistTags`
Version tags (latest, next, beta, etc.) pointing to specific versions.

```ts
import type { DistTags } from "@nodesecure/npm-types";

const tags: DistTags = {
  latest: "1.0.0",
  next: "2.0.0-beta.1"
};
```

#### `Spec`
Package specification string in the format `name@version`.

```ts
import type { Spec } from "@nodesecure/npm-types";

const spec: Spec = "lodash@4.17.21";
```

### Node.js Specific Types

#### `NodeExport` & `ConditionalNodeExport`
Types for Node.js conditional exports (ESM/CJS).

```ts
import type { NodeExport } from "@nodesecure/npm-types";

const exports: NodeExport = {
  import: "./dist/index.mjs",
  require: "./dist/index.cjs",
  default: "./dist/index.js"
};
```

#### `NodeImport`
Types for Node.js subpath imports (`#` imports).

```ts
import type { NodeImport } from "@nodesecure/npm-types";
```

### Additional Types

#### `PackTarball`
Metadata returned by `npm pack` command.

```ts
import type { PackTarball } from "@nodesecure/npm-types";
```

#### `Signature`
PGP signature information for signed packages.

```ts
import type { Signature } from "@nodesecure/npm-types";
```

## 🔍 Common Use Cases

### Parsing a package.json file

```ts
import type { PackageJSON } from "@nodesecure/npm-types";
import { readFileSync } from "node:fs";

const pkg: PackageJSON = JSON.parse(
  readFileSync("./package.json", "utf-8")
);
```

### Fetching registry metadata

```ts
import type { Packument } from "@nodesecure/npm-types";

const response = await fetch("https://registry.npmjs.org/lodash");
const packument: Packument = await response.json();

console.log(packument["dist-tags"].latest);
```

