// Import Third-party Dependencies
import { taggedString as tS } from "@nodesecure/i18n";

const scanner = {
  disable_scarf: "This dependency could collect data against your consent so think to disable it with the env var: SCARF_ANALYTICS",
  keylogging: "This dependency can retrieve your keyboard and mouse inputs. It can be used for 'keylogging' attacks/malwares.",
  typo_squatting: tS`Dependency '${0}' is similar to the following popular packages: ${1}`,
  dependency_confusion: "This dependency was found on both a public and private registry but its signature does not match",
  dependency_confusion_missing: "This dependency was found on the private but not on the public registry, this dependency is vulnerable to dependency confusion attacks.",
  dependency_confusion_missing_org: tS`The org '${0}' is not claimed on the public registry`,
  npx_confusion_unclaimed: tS`npx '${0}' found in package.json script ${1} of package ${2} and unclaimed on the public registry, an attacker can register that name and achieve RCE on every developer and CI pipeline that runs this script`,
  npx_confusion_claimed: tS`npx '${0}' found in package.json script ${1} of package ${2} and claimed on the public registry, verify that it is a trusted package, an attacker could have registered that name and achieve RCE on every developer and CI pipeline that runs this script`,
  bin_confusion_unclaimed: tS`Binary '${0}' found in package.json bin of ${1} and unclaimed on the public registry, an attacker can register that name and achieve RCE on every developer and CI pipeline that runs this binary`,
  bin_confusion_claimed: tS`Binary '${0}' found in package.json bin of ${1} and claimed on the public registry, verify that it is a trusted package, an attacker could have registered that name and achieve RCE on every developer and CI pipeline that runs this binary`
};

export default { scanner };
