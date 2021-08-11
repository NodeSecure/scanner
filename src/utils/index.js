export * from "./getTarballComposition.js";
export * from "./isSensitiveFile.js";
export * from "./getPackageName.js";
export * from "./npmRegistry.js";
export * from "./formatBytes.js";
export * from "./mergeDependencies";
export * from "./semver.js";
export * from "./cache.js";
export * from "./packageLock.js";
export * from "./dirname.js";

export const constants = {
  NPM_TOKEN: typeof process.env.NODE_SECURE_TOKEN === "string" ? { token: process.env.NODE_SECURE_TOKEN } : {},
  NPM_SCRIPTS: new Set(["preinstall", "postinstall", "preuninstall", "postuninstall"]),
  EXT_DEPS: new Set(["http", "https", "net", "http2", "dgram", "child_process"]),
  EXT_JS: new Set([".js", ".mjs", ".cjs"])
};
