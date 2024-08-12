// Import Node.js Dependencies
import { readdirSync } from "node:fs";
import path from "node:path";

// Import Internal Dependencies
import { readJSONSync } from "../utils/index.js";

// CONSTANTS
const kDefsDirectory = new URL("./defs", import.meta.url);

function loadJSONSchemaDefinition($defs: Record<string, any>, fileName: string) {
  const defName = path.basename(fileName, ".json");
  const jsonSchema = readJSONSync(`./defs/${fileName}`, import.meta.url);

  return { ...$defs, [defName]: jsonSchema };
}

export function loadJSONSchemaSync() {
  const mainSchema = readJSONSync("./nodesecurerc.json", import.meta.url);
  const $defs = readdirSync(kDefsDirectory)
    .filter((fileName) => path.extname(fileName) === ".json")
    .reduce(loadJSONSchemaDefinition, {});

  return Object.assign(mainSchema, { $defs });
}
