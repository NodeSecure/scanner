// Import Third-party Dependencies
import { getToken, taggedString } from "@nodesecure/i18n";

// CONSTANTS
const kDetectedDep = taggedString`The dependency '${0}' has been detected in the dependency Tree.`;
const kWarningsMessages = Object.freeze({
  "@scarf/scarf": getToken("warnings.disable_scarf"),
  iohook: getToken("warnings.keylogging")
});
const kPackages = new Set(Object.keys(kWarningsMessages));
const kAuthors = new Set(["marak", "marak.squires@gmail.com"]);

function getWarning(depName) {
  return `${kDetectedDep(depName)} ${kWarningsMessages[depName]}`;
}

export function getDependenciesWarnings(dependencies) {
  const warnings = [];
  for (const depName of kPackages) {
    if (dependencies.has(depName)) {
      warnings.push(getWarning(depName));
    }
  }

  // TODO: optimize with @nodesecure/author later
  for (const [packageName, dependency] of dependencies) {
    for (const { name, email } of dependency.metadata.maintainers) {
      if (kAuthors.has(name) || kAuthors.has(email)) {
        warnings.push(`'Marak Squires' package '${packageName}' has been detected in the dependency tree`);
      }
    }
  }

  return warnings;
}

