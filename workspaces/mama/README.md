<p align="center"><h1 align="center">
  @nodesecure/mama
</h1>

<p align="center">
  Manifest Manager
</p>

## Requirements
- [Node.js](https://nodejs.org/en/) v20 or higher

## Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i @nodesecure/mama
# or
$ yarn add @nodesecure/mama
```

## Usage example

```ts
import { ManifestManager } from "@nodesecure/mama";

const mama = await ManifestManager.fromPackageJSON(
  process.cwd()
);
console.log(mama.document);
console.log(mama.integrity);
```

## API

### (static) fromPackageJSON(location: string): Promise< ManifestManager >

Load a new instance using a `package.json` from the filesystem.

The **location** parameter can either be a full path or the path to the directory where the `package.json` is located.

### constructor(document: ManifestManagerDocument)

```ts
type ManifestManagerDocument =
  PackageJSON |
  WorkspacesPackageJSON |
  PackumentVersion;
```

Default values are injected if they are not present in the document. This behavior is necessary for the correct operation of certain functions, such as integrity recovery.

```js
{
  dependencies: {},
  devDependencies: {},
  scripts: {},
  gypfile: false
}
```

> [!NOTE]
> document is deep cloned (there will no longer be any reference to the object supplied as an argument)

### spec
Return the NPM specification (which is the combinaison of `name@version`).

> [!CAUTION]
> This property may not be available for Workspaces (if 'name' or 'version' properties are missing, it will throw an error).

### integrity
Return an integrity hash (which is a **string**) of the following properties:

```js
{
  name,
  version,
  dependencies,
  license: license ?? "NONE",
  scripts
}
```

If `dependencies` and `scripts` are missing, they are defaulted to an empty object `{}`

> [!CAUTION]
> This is not available for Workspaces

### author
Return the author parsed as a **Contact** (or `null` if the property is missing).

```ts
interface Contact {
  email?: string;
  url?: string;
  name: string;
}
```

### dependencies and devDependencies
Return the (dev) dependencies as an Array (of string)

```json
{
  "dependencies": {
    "kleur": "1.0.0"
  }
}
```

The above JSON will produce `["kleur"]`

### isWorkspace
Return true if `workspaces` property is present

> [!NOTE]
> Workspace are described by the interface `WorkspacesPackageJSON` (from @nodesecure/npm-types)

### flags

Since we've created this package for security purposes, the instance contains various flags indicating threats detected in the content:

- **isNative**: Contain an identified native package to build or provide N-API features like `node-gyp`.
- **hasUnsafeScripts**: Contain unsafe scripts like `install`, `preinstall`, `postinstall`...

```ts
import assert from "node:assert";

const mama = new ManifestManager({
  name: "hello",
  version: "1.0.0",
  scripts: {
    postinstall: "node malicious.js"
  }
});

assert.ok(mama.flags.hasUnsafeScripts);
```

The flags property is sealed (It is not possible to extend the list of flags)

> [!IMPORTANT]
> Read more about unsafe scripts [here](https://www.nerdycode.com/prevent-npm-executing-scripts-security/)

