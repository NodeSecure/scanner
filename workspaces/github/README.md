# Github

Download and (optionaly) extract github repository archive.

## Requirements

- [Node.js](https://nodejs.org/en/) v20 or higher

## Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i @nodesecure/github
# or
$ yarn add @nodesecure/github
```

## Usage example

```js
import * as github from "@nodesecure/github";

const utils = await github.download("NodeSecure.utils");
console.log(utils.location);

const scanner = await github.downloadAndExtract("NodeSecure.scanner");
console.log(scanner.location);
```

## API

Both `download` and `downloadAndExtract` functions use the same set of options.

```ts
interface DownloadOptions {
  /**
   * The destination (location) to extract the tar.gz
   *
   * @default process.cwd()
   */
  dest?: string;
  /**
   * The default github branch name (master, main ...)
   *
   * @default main
   */
  branch?: string;
  /**
   * Authentication token for private repositories
   *
   * @default process.env.GITHUB_TOKEN
   */
  token?: string;
}
```

### download(repository: string, options?: DownloadOptions): Promise< DownloadResult >
Download the tar.gz archive of the GIT repository.

```ts
interface DownloadResult {
  /** Archive or repository location on disk */
  location: string;
  /** Github repository name */
  repository: string;
  /** Github organization name */
  organization: string;
    /** Github branch name */
  branch: string;
}
```

### downloadAndExtract(repository: string, options?: DownloadExtractOptions): Promise< DownloadResult >
Use download but extract the tar.gz archive.

```ts
interface DownloadExtractOptions extends DownloadOptions {
  /**
   * Remove the tar.gz archive after a succesfull extraction
   *
   * @default true
   */
  removeArchive?: boolean;
}
```

## License

MIT
