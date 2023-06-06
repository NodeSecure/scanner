// Import Node.js Dependencies
import path from "node:path";
import { readFileSync } from "node:fs";

// Import Third-party Dependencies
import pacote from "pacote";
import semver from "semver";
import { getLocalRegistryURL } from "@nodesecure/npm-registry-sdk";

// Import Internal Dependencies
import { NPM_TOKEN } from "./index.js";

// CONSTANTS
const KVersionsToWarn = ["0.0.0", "0.0", "0"];

/**
 * @param {!string} version semver range
 * @returns {string} semver version
 *
 * @example
 * cleanRange(">=1.5.0"); // 1.5.0
 * cleanRange("^2.0.0"); // 2.0.0
 */
export function cleanRange(version) {
  // TODO: how do we handle complicated range like pkg-name@1 || 2 or pkg-name@2.1.2 < 3
  const firstChar = version.charAt(0);
  if (firstChar === "^" || firstChar === "<" || firstChar === ">" || firstChar === "=" || firstChar === "~") {
    return version.slice(version.charAt(1) === "=" ? 2 : 1);
  }

  return version;
}

/**
 * @param {!string} depName dependency name (WITHOUT version/range)
 * @param {!string} range semver range, ex: >=1.5.0
 */
export async function getExpectedSemVer(depName, range) {
  try {
    const { versions, "dist-tags": { latest } } = await pacote.packument(depName, {
      ...NPM_TOKEN, registry: getLocalRegistryURL()
    });
    const currVersion = semver.maxSatisfying(Object.keys(versions), range);

    return currVersion === null ? [latest, true] : [currVersion, semver.eq(latest, currVersion)];
  }
  catch (err) {
    return [cleanRange(range), true];
  }
}

export async function getCleanDependencyName([depName, range]) {
  const [depVer, isLatest] = await getExpectedSemVer(depName, range);

  return [`${depName}@${range}`, `${depName}@${depVer}`, isLatest];
}

export function addSASTWarning(dirPath) {
  const packageJsonPath = path.join(dirPath, "package.json");

  const packageJsonVersion = JSON.parse(readFileSync(packageJsonPath, "utf8")).version;

  if (KVersionsToWarn.includes(packageJsonVersion)) {
    throw new Error("The version of package.json is invalid");
  }

  return true;
}
