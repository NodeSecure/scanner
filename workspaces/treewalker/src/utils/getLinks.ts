// CONSTANTS
const kVCSHosts = new Set(["github.com", "gitlab.com"]);

function getVCSRepositoryURL(link) {
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

/**
 * @param {import("@nodesecure/npm-registry-sdk").PackumentVersion} packumentVersion
 */
export function getLinks(
  packumentVersion
) {
  const homepage = packumentVersion.homepage || null;
  const repositoryUrl = packumentVersion.repository?.url || null;

  return {
    npm: `https://www.npmjs.com/package/${packumentVersion.name}/v/${packumentVersion.version}`,
    homepage,
    repository: getVCSRepositoryURL(homepage) ?? getVCSRepositoryURL(repositoryUrl)
  };
}
