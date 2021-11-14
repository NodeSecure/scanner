export * from "./getTarballComposition.js";
export * from "./isSensitiveFile.js";
export * from "./getPackageName.js";
export * from "./mergeDependencies.js";
export * from "./semver.js";
export * from "./dirname.js";
export * from "./warnings.js";
export * from "./filterDependencyKind.js";
export * from "./analyzeDependencies.js";
export * from "./booleanToFlags.js";

export const NPM_TOKEN = typeof process.env.NODE_SECURE_TOKEN === "string" ?
  { token: process.env.NODE_SECURE_TOKEN } :
  {};
