// Import Third-party Dependencies
import { packument } from "@nodesecure/npm-registry-sdk";

function getVCSRepositoryURL(host, link) {
  try {
    const url = new URL(link);
    const { hostname, pathname } = url;

    if (hostname !== host) {
      return null;
    }

    const [owner, repo] = pathname.split("/").filter(Boolean).map((curr) => curr.replace(".git", ""));

    return `https://${host}/${owner}/${repo}`;
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
    github: getVCSRepositoryURL("github.com", homepage ?? repositoryUrl),
    gitlab: getVCSRepositoryURL("gitlab.com", homepage ?? repositoryUrl)
  };
}
