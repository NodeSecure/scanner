export * from "./dirname.js";
export * from "./warnings.js";
export * from "./addMissingVersionFlags.js";
export * from "./getLinks.js";
export * from "./urlToString.js";
export * from "./getUsedDeps.js";
export * from "./isNodesecurePayload.js";

export const NPM_TOKEN = typeof process.env.NODE_SECURE_TOKEN === "string" ?
  { token: process.env.NODE_SECURE_TOKEN } :
  {};
