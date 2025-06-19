// Import Node.js Dependencies
import path from "node:path";
import {
  createWriteStream
} from "node:fs";

// Import Third-party Dependencies
import httpie from "@myunisoft/httpie";

// Import Internal Dependencies
import * as utils from "../utils.js";
import * as gitlab from "../gitlab/types.js";

// CONSTANTS
export const GITLAB_DEFAULT_URL = new URL("https://gitlab.com/api/v4/projects/");

export interface DownloadOptions {
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

export interface DownloadResult {
  /** Archive or repository location on disk */
  location: string;
  /** Gitlab repository name */
  repository: string;
  /** Gitlab organization name */
  organization: string;
  /** Gitlab branch name */
  branch: string;
}

export async function download(
  repository: string,
  options: DownloadOptions = Object.create(null)
): Promise<DownloadResult> {
  if (typeof repository !== "string") {
    throw new TypeError("repository must be a string!");
  }
  const {
    branch = null,
    dest = process.cwd(),
    token = process.env.GITLAB_TOKEN,
    gitlab = GITLAB_DEFAULT_URL
  } = options;

  const headers = {
    authorization: typeof token === "string" ? `Bearer ${token}` : void 0,
    "user-agent": "NodeSecure"
  };

  const repositoryURL = new URL(utils.getRepositoryPath(repository), gitlab);
  const { data: gitlabManifest } = await httpie.get<gitlab.Project>(repositoryURL, {
    headers,
    maxRedirections: 1
  });

  const wantedBranch = typeof branch === "string" ? branch : gitlabManifest.default_branch;
  const location = path.join(dest, `${gitlabManifest.name}-${wantedBranch}.tar.gz`);

  // Download the archive with the repositoryId
  const archiveURL = new URL(
    `${gitlabManifest.id}/repository/archive.tar.gz?ref=${wantedBranch}`,
    gitlab
  );
  const writableCallback = httpie.stream("GET", archiveURL, {
    headers: { ...headers, "Accept-Encoding": "gzip, deflate" },
    maxRedirections: 1
  });
  await writableCallback(() => createWriteStream(location));

  return {
    location,
    branch: wantedBranch,
    organization: gitlabManifest.path_with_namespace.split("/")[0],
    repository: gitlabManifest.name
  };
}
