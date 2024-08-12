/* eslint-disable max-len */

// Require Internal Dependencies
import { taggedString as tS } from "../src/utils.js";

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

const sast_warnings = {
  parsing_error: "An error occured when parsing the JavaScript code with meriyah. It mean that the conversion from string to AST has failed. If you encounter such an error, please open an issue here.",
  unsafe_import: "Unable to follow an import (require, require.resolve) statement/expr.",
  unsafe_regex: "A RegEx as been detected as unsafe and may be used for a ReDoS Attack.",
  unsafe_stmt: "Usage of dangerous statement like eval() or Function(\"\").",
  unsafe_assign: "Assignment of a protected global like process or require.",
  encoded_literal: "An encoded literal has been detected (it can be an hexa value, unicode sequence, base64 string etc)",
  suspicious_file: "A suspicious file with more than ten encoded-literal in it.",
  short_identifiers: "This mean that all identifiers has an average length below 1.5. Only possible if the file contains more than 5 identifiers.",
  suspicious_literal: "This mean that the sum of suspicious score of all Literals is bigger than 3.",
  obfuscated_code: "There's a very high probability that the code is obfuscated...",
  weak_crypto: "The code probably contains a weak crypto algorithm (md5, sha1...)",
  shady_link: "A Literal (string) contains an URL to a domain with a suspicious extension.",
  zeroSemVer: "Semantic version starting with 0.x (unstable project or without serious versioning)"
};

export const english = { lang, depWalker, warnings, sast_warnings };
