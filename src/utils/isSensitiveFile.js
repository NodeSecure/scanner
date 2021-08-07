// Import Node.js Dependencies
import path from "path";

// CONSTANTS
const kSensitiveFileName = new Set([".npmrc", ".env"]);
const kSensitiveFileExtension = new Set([".key", ".pem"]);

export function isSensitiveFile(fileName) {
  return kSensitiveFileName.has(path.basename(fileName)) ||
    kSensitiveFileExtension.has(path.extname(fileName));
}
