// Import Third-party Dependencies
import { getToken, taggedString } from "@nodesecure/i18n";
import { extractAllAuthors } from "@nodesecure/authors";

// CONSTANTS
const kDetectedDep = taggedString`The dependency '${0}' has been detected in the dependency Tree.`;
const kFlaggedAuthors = [{
  name: "marak",
  email: "marak.squires@gmail.com"
}];
const kDependencyWarnMessage = Object.freeze({
  "@scarf/scarf": await getToken("warnings.disable_scarf"),
  iohook: await getToken("warnings.keylogging")
});

/**
 * @param {Map<string, any>} dependenciesMap
 */
export async function getDependenciesWarnings(dependenciesMap) {
  const warnings = [...Object.keys(kDependencyWarnMessage)]
    .filter((depName) => dependenciesMap.has(depName))
    .map((depName) => `${kDetectedDep(depName)} ${kDependencyWarnMessage[depName]}`);

  // TODO: add support for RC configuration
  const res = await extractAllAuthors(
    { dependencies: Object.fromEntries(dependenciesMap) },
    { flags: kFlaggedAuthors, domainInformations: false }
  );

  return {
    warnings,
    flaggedAuthors: res.flaggedAuthors
  };
}
