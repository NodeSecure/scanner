/**
 * @see https://docs.gitlab.com/ee/api/index.html#namespaced-path-encoding
 * @example
 * getRepositoryPath("51886657"); // "51886657"
 * getRepositoryPath("myorg.foo.bar") // "myorg%2Ffoo%2Fbar"
 */
export function getRepositoryPath(
  repository: string
): string {
  const repoId = Number.parseInt(repository, 10);

  return Number.isNaN(repoId) ? repository.split(".").join("%2F") : String(repoId);
}
