// Require Third-party Dependencies
import { taggedString } from "./utils";
import { getToken } from "./i18n";

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

function applyWarnings(dependencies) {
  const warnings = [];
  for (const depName of kPackages) {
    if (dependencies.has(depName)) {
      warnings.push(getWarning(depName));
    }
  }

  return warnings;
}

export default applyWarnings;
