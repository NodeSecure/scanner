export * from "./warnings.ts";
export * from "./addMissingVersionFlags.ts";
export * from "./getLinks.ts";
export * from "./urlToString.ts";
export * from "./getUsedDeps.ts";
export * from "./isNodesecurePayload.ts";
export * from "./npmrc.ts";

export interface WithStatusCode {
  statusCode: number;
}

// TODO: replace with isHTTPError or isHttpieError when those ones will be fixed in @openally/httpie
export function hasStatusCode(err: unknown): err is WithStatusCode {
  return (
    typeof err === "object" &&
    err !== null &&
    "statusCode" in err &&
    typeof (err as { statusCode?: unknown; }).statusCode === "number"
  );
}

export const NPM_TOKEN = typeof process.env.NODE_SECURE_TOKEN === "string" ?
  { token: process.env.NODE_SECURE_TOKEN } :
  {};
