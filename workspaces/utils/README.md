<p align="center">
  <img src="https://user-images.githubusercontent.com/4438263/287494046-1121d658-3adb-4cca-9751-659e530f5a93.jpg" alt="@nodesecure/utils">
</p>

<p align="center">
  NodeSecure utilities.
</p>

## Requirements

- [Node.js](https://nodejs.org/en/) v20 or higher

## Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i @nodesecure/utils
# or
$ yarn add @nodesecure/utils
```

## Usage example

```js
import * as utils from "@nodesecure/utils";

console.log(utils.parseAuthor("GENTILHOMME Thomas <foo.bar@gmail.com>"));
```

## API

The following functions are exposed through `utils`.

### `formatBytes(bytes: number): string`

Converts a size in bytes to a human-readable string with matching units (B, KB, MB, GB, etc.).

```js
import * as utils from "@nodesecure/utils";

utils.formatBytes(10); // 10 B
utils.formatBytes(3000); // 2.93 KB
```

### `locationToString(location: number[][]): string`

Transforms a JS-X-Ray location to string.
The first array is the start with [line, column].
The second one is the end with [line, column].

```js
import * as utils from "@nodesecure/utils";

console.log(
  utils.locationToString([
    [3, 4],
    [3, 37],
  ])
); // [3:4] - [3:37]
```

### `taggedString(strings: TemplateStringsArray, ...keys: (number | string)[]): (...values: (string | number | { [key: string]: any; })[]) => string`

TemplateStringsArray being the following interface:

`interface TemplateStringsArray extends ReadonlyArray<string> {
    readonly raw: readonly string[];
}`

This function allows you to create a string template with placeholders that can be replaced by values later.

```js
import * as utils from "@nodesecure/utils";

const myStrClojure = taggedString`Hello ${0}!`;
console.log(myStrClojure("Thomas")); // Hello Thomas!
```

### `parseAuthor(author: any): ParsedMaintainer | null`

ParsedMaintainer being the following type:

`type ParsedMaintainer = {
    name: string;
    email?: string;
    url?: string;
};`

Parses an author string into a structured object.

[NPM documentation - People fields](https://docs.npmjs.com/cli/v7/configuring-npm/package-json#people-fields-author-contributors)

```js
import * as utils from "@nodesecure/utils";

console.log(utils.parseAuthor("GENTILHOMME Thomas <foobar@gmail.com>")); // { name: 'GENTILHOMME Thomas', email: 'foobar@gmail.com' }
```

### `parseManifestAuthor(manifestAuthorField: string): utils.ParsedMaintainer | null`

Parses an author string from a package manifest (like `package.json`) into a structured object.

```js
import * as utils from "@nodesecure/utils";

console.log(utils.parseManifestAuthor("GENTILHOMME Thomas <gentilhomme.thomas@gmail.com>")); // { name: "GENTILHOMME Thomas", email: "gentilhomme.thomas@gmail.com" }
console.log(utils.parseManifestAuthor("John-David Dalton <john.david.dalton@gmail.com> (http://allyoucanleet.com/)")); // { name: "John-David Dalton", email: "john.david.dalton@gmail.com", url: "http://allyoucanleet.com/" }
```

### `getScoreColor(score: number): "red" | "orange" | "blue" | "green"`

Returns the color for a given score.

Score between 0 and 3.9: red
Score between 4 and 6.4: orange
Score between 6.5 and 8.4: blue
Score between 8.5 and 10: green

```js
import * as utils from "@nodesecure/utils";

console.log(utils.getScoreColor(6)); // orange
console.log(utils.getScoreColor(9.1)); // green
```

### `getVCSRepositoryPathAndPlatform(url: string | URL): [path: string, platform: string] | null`

Returns an array with the repository path and platform from a VCS URL.
VCS means Version Control System, like Git.

```js
import * as utils from "@nodesecure/utils";

console.log(utils.getVCSRepositoryPathAndPlatform("http://github.com/foo/bar")); // [ 'foo/bar', 'github.com' ]
console.log(utils.getVCSRepositoryPathAndPlatform("https://github.com/foo/bar.git")); // ["foo/bar", "github.com"]
```

## License

MIT
