// Import Third-party Dependencies
import type {
  PackageJSON,
  WorkspacesPackageJSON,
  PackumentVersion
} from "@nodesecure/npm-types";

// CONSTANTS
const kVCSHosts = new Set(["github.com", "gitlab.com"]);

function getVCSRepositoryURL(
  link: string | null
): string | null {
  if (!link) {
    return null;
  }

  try {
    const url = new URL(link);
    const { hostname, pathname } = url;

    if (kVCSHosts.has(hostname) === false) {
      return null;
    }

    const [owner, repo] = pathname.split("/").filter(Boolean).map((curr) => curr.replace(".git", ""));

    return `https://${hostname}/${owner}/${repo}`;
  }
  catch {
    return null;
  }
}

export function getLinks(
  packumentVersion: PackumentVersion
) {
  const homepage = packumentVersion.homepage || null;
  const repositoryUrl = typeof packumentVersion.repository === "string" ?
    packumentVersion.repository :
    packumentVersion.repository?.url ?? null;

  return {
    npm: `https://www.npmjs.com/package/${packumentVersion.name}/v/${packumentVersion.version}`,
    homepage,
    repository:
      getVCSRepositoryURL(homepage) ??
      getVCSRepositoryURL(repositoryUrl)
  };
}

export function getManifestLinks(
  manifest: PackageJSON | WorkspacesPackageJSON
) {
  const homepage = manifest.homepage ?? null;
  const repositoryUrl = typeof manifest.repository === "string" ?
    manifest.repository :
    manifest.repository?.url ?? null;

  return {
    npm: null,
    homepage,
    repository:
      getVCSRepositoryURL(homepage) ??
      getVCSRepositoryURL(repositoryUrl)
  };
}
