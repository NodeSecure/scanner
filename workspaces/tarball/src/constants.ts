export const NPM_TOKEN = typeof process.env.NODE_SECURE_TOKEN === "string" ?
  { token: process.env.NODE_SECURE_TOKEN } :
  {};

/**
 * @see https://www.nerdycode.com/prevent-npm-executing-scripts-security/
 */
export const UNSAFE_SCRIPTS = new Set([
  "install",
  "preinstall",
  "postinstall",
  "preuninstall",
  "postuninstall"
]);
