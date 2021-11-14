// Import Node.js Dependencies
import path from "path";

// CONSTANTS
const kSensitiveFileName = new Set([".npmrc", ".env"]);
const kSensitiveFileExtension = new Set([".key", ".pem"]);

/**
 * @see https://github.com/jandre/safe-commit-hook/blob/master/git-deny-patterns.json
 *
 * @param {!string} fileName
 * @returns {boolean}
 */
export function isSensitiveFile(fileName) {
  return kSensitiveFileName.has(path.basename(fileName)) ||
    kSensitiveFileExtension.has(path.extname(fileName));
}
