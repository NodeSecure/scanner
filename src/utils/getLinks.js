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

export function getLinks(pkg) {
  const homepage = pkg.homepage || null;
  const repositoryUrl = pkg.repository?.url || null;

  return {
    npm: `https://www.npmjs.com/package/${pkg.name}/v/${pkg.version}`,
    homepage,
    repository: getVCSRepositoryURL(homepage) ?? getVCSRepositoryURL(repositoryUrl)
  };
}
