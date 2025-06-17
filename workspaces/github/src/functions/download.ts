// Import Node.js Dependencies
import * as path from "node:path";
import { createWriteStream } from "node:fs";

// Import Third-party Dependencies
import httpie from "@myunisoft/httpie";

// CONSTANTS
const kGithubURL = new URL("https://github.com/");
const kDefaultBranch = "main";

export interface DownloadOptions {
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

export interface DownloadResult {
  /** Archive or repository location on disk */
  location: string;
  /** Github repository name */
  repository: string;
  /** Github organization name */
  organization: string;
  /** Github branch name */
  branch: string;
}

/**
 * @example
 * const { location } = await github.download("NodeSecure.utils", {
 *  dest: __dirname
 * });
 * console.log(location);
 */
export async function download(
  repository: string,
  options: DownloadOptions = Object.create(null)) {
  if (typeof repository !== "string") {
    throw new TypeError("repository must be a string!");
  }
  const {
    branch = kDefaultBranch,
    dest = process.cwd(),
    token = process.env.GITHUB_TOKEN
  } = options;

  // Create URL!
  const [organization, repo] = repository.split(".");
  const repositoryURL = new URL(`${organization}/${repo}/archive/${branch}.tar.gz`, kGithubURL);
  const location = path.join(dest, `${repo}-${branch}.tar.gz`);

  const writableCallback = httpie.stream("GET", repositoryURL, {
    headers: {
      "User-Agent": "NodeSecure",
      "Accept-Encoding": "gzip, deflate",
      Authorization: typeof token === "string" ? `token ${token}` : void 0
    },
    maxRedirections: 1
  });
  await writableCallback(() => createWriteStream(location));

  return {
    location,
    organization,
    repository: repo,
    branch
  };
}
