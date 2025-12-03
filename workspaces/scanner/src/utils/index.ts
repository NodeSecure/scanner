export * from "./dirname.ts";
export * from "./warnings.ts";
export * from "./addMissingVersionFlags.ts";
export * from "./getLinks.ts";
export * from "./urlToString.ts";
export * from "./getUsedDeps.ts";
export * from "./isNodesecurePayload.ts";

export const NPM_TOKEN = typeof process.env.NODE_SECURE_TOKEN === "string" ?
  { token: process.env.NODE_SECURE_TOKEN } :
  {};
