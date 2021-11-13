export * from "./getTarballComposition.js";
export * from "./isSensitiveFile.js";
export * from "./getPackageName.js";
export * from "./mergeDependencies.js";
export * from "./semver.js";
export * from "./dirname.js";
export * from "./warnings.js";
export * from "./filterDependencyKind.js";

export const constants = {
  NPM_TOKEN: typeof process.env.NODE_SECURE_TOKEN === "string" ? { token: process.env.NODE_SECURE_TOKEN } : {},
  NPM_SCRIPTS: new Set(["preinstall", "postinstall", "preuninstall", "postuninstall"]),
  EXT_DEPS: new Set(["http", "https", "net", "http2", "dgram", "child_process"]),
  EXT_JS: new Set([".js", ".mjs", ".cjs"])
};
