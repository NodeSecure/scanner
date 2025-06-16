export function getScoreColor(score: number) {
  if (score < 4) {
    return "red";
  }
  if (score < 6.5) {
    return "orange";
  }
  if (score < 8.5) {
    return "blue";
  }

  return "green";
}

export function getVCSRepositoryPathAndPlatform(url: string | URL): [path: string, platform: string] | null {
  if (!url) {
    return null;
  }

  try {
    const repo = new URL(url);

    const repoPath = repo.pathname.slice(
      1,
      repo.pathname.includes(".git") ? -4 : repo.pathname.length
    );

    return [repoPath, repo.host];
  }
  catch {
    return null;
  }
}
