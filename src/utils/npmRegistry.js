// Import Node.js Dependencies
import { spawnSync } from "child_process";

// CONSTANTS
const REGISTRY_DEFAULT_ADDR = "https://registry.npmjs.org/";

// VARS
let localNPMRegistry = null;

/**
 * @returns {string}
 */
export function getRegistryURL(force = false) {
  if (localNPMRegistry !== null && !force) {
    return localNPMRegistry;
  }

  try {
    const stdout = spawnSync(
      `npm${process.platform === "win32" ? ".cmd" : ""}`, ["config", "get", "registry"]).stdout.toString();
    localNPMRegistry = stdout.trim() === "" ? REGISTRY_DEFAULT_ADDR : stdout.trim();

    return localNPMRegistry;
  }
  catch (error) {
    /* istanbul ignore next */
    return REGISTRY_DEFAULT_ADDR;
  }
}

export const DEFAULT_REGISTRY_ADDR = getRegistryURL();
