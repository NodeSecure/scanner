// Import Third-party Dependencies
import { taggedString as tS } from "@nodesecure/i18n";

const scanner = {
  disable_scarf: "This dependency could collect data against your consent so think to disable it with the env var: SCARF_ANALYTICS",
  keylogging: "This dependency can retrieve your keyboard and mouse inputs. It can be used for 'keylogging' attacks/malwares.",
  typo_squatting: tS`The package '${0}' is similar to the following popular packages: ${1}`,
  dependency_confusion: "This dependency was found on both a public and private registry but its signature does not match",
  dependency_confusion_missing_org: tS`The org '${0}' is not claimed on the public registry`
};

export default { scanner };
