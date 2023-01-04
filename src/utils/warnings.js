// Import Third-party Dependencies
import { getToken, taggedString } from "@nodesecure/i18n";
import { extractAllAuthorsFromLibrary } from "@nodesecure/authors";

// CONSTANTS
const kDetectedDep = taggedString`The dependency '${0}' has been detected in the dependency Tree.`;
const kWarningsMessages = Object.freeze({
  "@scarf/scarf": getToken("warnings.disable_scarf"),
  iohook: getToken("warnings.keylogging")
});
const kPackages = new Set(Object.keys(kWarningsMessages));
const kFlaggedAuthors = [{
  username: "marak",
  email: "marak.squires@gmail.com"
}];

function getWarning(depName) {
  return `${kDetectedDep(depName)} ${kWarningsMessages[depName]}`;
}

export async function getDependenciesWarnings(dependenciesMap) {
  const warnings = [];
  for (const depName of kPackages) {
    if (dependenciesMap.has(depName)) {
      warnings.push(getWarning(depName));
    }
  }
  // TODO: add support for RC configuration
  const authors = await extractAllAuthorsFromLibrary(
    { dependencies: Object.fromEntries(dependenciesMap) },
    { flags: kFlaggedAuthors, domainInformations: false }
  );

  return {
    warnings,
    authors
  };
}
