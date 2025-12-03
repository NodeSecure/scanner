// CONSTANTS
export const NPM_TOKEN = typeof process.env.NODE_SECURE_TOKEN === "string" ?
  { token: process.env.NODE_SECURE_TOKEN } :
  {};

export * from "./mergeDependencies.ts";
export * from "./isGitDependency.ts";
export * from "./semver.ts";
