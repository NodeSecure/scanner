<p align="center"><h1 align="center">
  @nodesecure/gitlab
</h1>

<p align="center">
  Download and (optionaly) extract GitLab repository archive.
</p>

## Requirements

- [Node.js](https://nodejs.org/en/) v24 or higher

## Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i @nodesecure/gitlab
# or
$ yarn add @nodesecure/gitlab
```

## Usage example

```js
import * as gitlab from "@nodesecure/gitlab";

// Note: repository can be either namespace path or repository ID
const result = await gitlab.download(
  "NodeSecure.utils"
);
console.log(result);
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
   * The default gitlab branch name (master, main ...).
   * By default it fetch the "default" gitlab branch.
   *
   * @default null
   */
  branch?: string | null;
  /**
   * Authentication token for private repositories
   *
   * @default process.env.GITLAB_TOKEN
   */
  token?: string;
  /**
   * @default https://gitlab.com/api/v4/projects/
   */
  gitlab?: string;
}
```

### download(repository: string, options?: DownloadOptions): Promise< DownloadResult >
Download the tar.gz archive of the GIT repository.

```ts
interface DownloadResult {
  /** Archive or repository location on disk */
  location: string;
  /** Gitlab repository name */
  repository: string;
  /** Gitlab organization name */
  organization: string;
  /** Gitlab branch name */
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
