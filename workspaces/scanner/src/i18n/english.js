// Import Third-party Dependencies
import { taggedString as tS } from "@nodesecure/i18n";

const scanner = {
  disable_scarf: "This dependency could collect data against your consent so think to disable it with the env var: SCARF_ANALYTICS",
  keylogging: "This dependency can retrieve your keyboard and mouse inputs. It can be used for 'keylogging' attacks/malwares.",
  typo_squatting: tS`The package '${0}' is similar to the following popular packages: ${1}`
};

export default { scanner };
