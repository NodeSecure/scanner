// Import Third-party Dependencies
import pacote from "pacote";
import semver from "semver";
import { getLocalRegistryURL } from "@nodesecure/npm-registry-sdk";

// Import Internal Dependencies
import { NPM_TOKEN } from "./index.js";

/**
 * @example
 * cleanRange(">=1.5.0"); // 1.5.0
 * cleanRange("^2.0.0"); // 2.0.0
 */
export function cleanRange(
  version: string
): string {
  // TODO: how do we handle complicated range like pkg-name@1 || 2 or pkg-name@2.1.2 < 3
  const firstChar = version.charAt(0);
  if (firstChar === "^" || firstChar === "<" || firstChar === ">" || firstChar === "=" || firstChar === "~") {
    return version.slice(version.charAt(1) === "=" ? 2 : 1);
  }

  return version;
}

export async function getExpectedSemVer(
  dependencyName: string,
  range: string
): Promise<[version: string, isLatest: boolean]> {
  try {
    const { versions, "dist-tags": { latest } } = await pacote.packument(dependencyName, {
      ...NPM_TOKEN,
      registry: getLocalRegistryURL()
    });
    const currVersion = semver.maxSatisfying(
      Object.keys(versions),
      range
    );

    return currVersion === null ?
      [latest, true] :
      [currVersion, semver.eq(latest, currVersion)];
  }
  catch {
    return [cleanRange(range), true];
  }
}

export async function getCleanDependencyName(
  dependency: [name: string, range: string]
): Promise<[string, string, boolean]> {
  const [dependencyName, semVerRange] = dependency;
  const [dependencyVersion, isLatest] = await getExpectedSemVer(
    dependencyName,
    semVerRange
  );

  return [
    `${dependencyName}@${semVerRange}`,
    `${dependencyName}@${dependencyVersion}`,
    isLatest
  ];
}
