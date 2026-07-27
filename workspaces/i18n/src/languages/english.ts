// Import Third-party Dependencies
import { sast_warnings } from "@nodesecure/js-x-ray/i18n/english";

// Require Internal Dependencies
import { taggedString as tS } from "../utils.ts";

const lang = "en";

const depWalker = {
  dep_tree: "dependency tree",
  fetch_and_walk_deps: "Fetching and walking through all dependencies...",
  fetch_on_registry: "Waiting for packages to fetch from npm registry...",
  waiting_tarball: "Waiting tarballs to be analyzed...",
  fetch_metadata: "Fetched package metadata:",
  analyzed_tarball: "Analyzed npm tarballs:",
  success_fetch_deptree: tS`Successfully navigated through the ${0} in ${1}`,
  success_tarball: tS`Successfully analyzed ${0} packages tarballs in ${1}`,
  success_registry_metadata: "Successfully fetched required metadata for all packages!",
  failed_rmdir: tS`Failed to remove directory ${0}!`
};

const warnings = {
  disable_scarf: "This dependency could collect data against your will so think to disable it with the env var: SCARF_ANALYTICS",
  keylogging: "This dependency can retrieve your keyboard and mouse inputs. It can be used for 'keylogging' attacks/malwares."
};

const package_warnings = {
  zero_semver: "Semantic version starting with 0.x (unstable project or without serious versioning)",
  empty_package: "The package tarball only contains a package.json file."
};

export const english = { lang, depWalker, warnings, sast_warnings, package_warnings };
