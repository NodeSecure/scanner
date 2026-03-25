export const NATIVE_CODE_EXTENSIONS = new Set([".gyp", ".c", ".cpp", ".node", ".so", ".h"]);

export const NPM_TOKEN = typeof process.env.NODE_SECURE_TOKEN === "string" ?
  { token: process.env.NODE_SECURE_TOKEN } :
  {};
