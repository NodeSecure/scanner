<p align="center">
  <img
    alt="fs-walk"
    src="https://github.com/NodeSecure/rfcs/assets/4438263/175b9aae-15fb-4374-acd9-da8401f25ea5"
    width="650"
  >
</p>

<p align="center">
  Modern FileSystem (fs) utilities to lazy walk directories Asynchronously (but also Synchronously). Under the hood the code has been created using ES6 Generators.
</p>

## Features

- Lazy walk by using [fs.opendir](https://nodejs.org/api/fs.html#fs_fspromises_opendir_path_options).
- Zero dependencies.
- Enforce usage of Symbols for CONSTANTS.
- Synchronous API.

> [!NOTE]
> Performance over some of the features is a non-goal.

## Requirements

- [Node.js](https://nodejs.org/en/) v20 or higher

## Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i @nodesecure/fs-walk
# or
$ yarn add @nodesecure/fs-walk
```

## Usage example

```js
import path from "node:path";
import { walk } from "@nodesecure/fs-walk";

for await (const [dirent, absoluteFileLocation] of walk(".")) {
  if (dirent.isFile()) {
    console.log(absoluteFileLocation);
    console.log(path.extname(absoluteFileLocation));
  }
}
```

## API

```ts
export interface WalkOptions {
  extensions?: Set<string>;
}

export type WalkEntry = [dirent: fs.Dirent, absoluteFileLocation: string];
```

### walk(directory: string, options?: WalkOptions): AsyncIterableIterator< WalkEntry >

Asynchronous walk.

### walkSync(directory: string, options?: WalkOptions): IterableIterator< WalkEntry >

Synchronous walk (using readdirSync under the hood instead of opendir).

For example fetching JavaScript files for a given location:

```js
import { walkSync } from "@nodesecure/fs-walk";

const javascriptFiles = [...walkSync("./someDirectory", { extensions: new Set([".js"]) }))]
    .filter(([dirent]) => dirent.isFile())
    .map(([, absoluteFileLocation]) => absoluteFileLocation);

console.log(javascriptFiles);
```

## License

MIT
