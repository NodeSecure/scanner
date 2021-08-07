// Import Third-party Dependencies
import { getToken, taggedString } from "@nodesecure/i18n";

// CONSTANTS
const kDetectedDep = taggedString`The dependency '${0}' has been detected in the dependency Tree.`;
const kWarningsMessages = Object.freeze({
  "@scarf/scarf": getToken("warnings.disable_scarf"),
  iohook: getToken("warnings.keylogging")
});
const kPackages = new Set(Object.keys(kWarningsMessages));

function getWarning(depName) {
  return `${kDetectedDep(depName)} ${kWarningsMessages[depName]}`;
}

export default function applyWarnings(dependencies) {
  const warnings = [];
  for (const depName of kPackages) {
    if (dependencies.has(depName)) {
      warnings.push(getWarning(depName));
    }
  }

  return warnings;
}

