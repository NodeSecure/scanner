// Import Third-party Dependencies
import { fetchLazy } from "@dashlog/fetch-github-repositories";
import pacote from "pacote";

interface Repository {
  name: string;
  url: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  optionalDependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
}

interface ScanOrganizationOptions {
  orgName: string;
  githubToken?: string;
  onProgress?: (repo: { name: string; url: string; }) => void;
}

async function scanOrganization(options: ScanOrganizationOptions): Promise<Repository[]> {
  const { orgName, githubToken, onProgress } = options;

  const results: Repository[] = [];
  const lazyRepos = fetchLazy(orgName, {
    kind: "orgs",
    token: githubToken
  });

  for await (const repo of lazyRepos) {
    onProgress?.({ name: repo.name, url: repo.html_url });
    try {
      const manifest = await pacote.manifest(`${orgName}/${repo.name}`, {
        token: githubToken
      });

      results.push({
        name: repo.name,
        url: repo.html_url,
        dependencies: manifest.dependencies || {},
        devDependencies: manifest.devDependencies || {},
        optionalDependencies: manifest.optionalDependencies || {},
        peerDependencies: manifest.peerDependencies || {}
      });
    }
    catch (_error) {
      // Ignore repositories without a package.json
    }
  }

  return results;
}

export {
  scanOrganization
};
