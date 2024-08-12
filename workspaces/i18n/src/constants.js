// Import Node.js Dependencies
import os from "node:os";
import path from "node:path";

export const CACHE_PATH = path.join(os.tmpdir(), "nsecure-cli");
export const CURRENT_LANG = "english";
