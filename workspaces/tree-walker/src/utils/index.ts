export * from "./mergeDependencies.js";
export * from "./isGitDependency.js";
export * from "./semver.js";

export const NPM_TOKEN = typeof process.env.NODE_SECURE_TOKEN === "string" ?
  { token: process.env.NODE_SECURE_TOKEN } :
  {};
