// CONSTANTS
const kBytesSize = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

/**
 * @param {!number} bytes
 * @returns {string}
 *
 * @example
 * formatBytes(10); // 10 B
 * formatBytes(3000); // 2.93 KB
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) {
    return "0 B";
  }
  const id = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = parseFloat((bytes / Math.pow(1024, id)).toFixed(2));

  return `${size} ${kBytesSize[id]}`;
}
