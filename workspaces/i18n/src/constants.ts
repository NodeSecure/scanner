// Import Node.js Dependencies
import os from "node:os";
import path from "node:path";

export type Languages = "french" | "english" | (string & {});

export const CACHE_PATH = path.join(os.tmpdir(), "nsecure-cli");
export const CURRENT_LANG: Languages = "english";
