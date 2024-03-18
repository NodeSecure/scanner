// Import Node.js Dependencies
import path from "node:path";

// CONSTANTS
const kSensitiveFileName = new Set([".npmrc", ".env"]);
const kSensitiveFileExtension = new Set([".key", ".pem"]);

/**
 * @see https://github.com/jandre/safe-commit-hook/blob/master/git-deny-patterns.json
 */
export function isSensitiveFile(
  fileName: string
): boolean {
  return kSensitiveFileName.has(path.basename(fileName)) ||
    kSensitiveFileExtension.has(path.extname(fileName));
}
