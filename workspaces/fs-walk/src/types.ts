// Import Node.js Dependencies
import { Dirent } from "node:fs";

export interface WalkOptions {
  /**
   * Whitelist of extensions
   *
   * @example
   * new Set([".js", ".cjs", ".mjs"]);
   */
  extensions?: Set<string>;
}

export type WalkEntry = [dirent: Dirent, absoluteFileLocation: string];
