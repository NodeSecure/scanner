// Import Node.js Dependencies
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

// Import Third-party Dependencies
import zup from "zup";

// Import Internal Dependencies
import { english } from "../src/languages/english.js";
import { french } from "../src/languages/french.js";

// CONSTANTS
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const kProjectRootDir = path.join(__dirname, "..");
const kTokens = {
  english,
  french
};

function flatten(
  obj: any,
  roots: string[] = [],
  sep = "."
) {
  return Object
    .keys(obj)
    .reduce(
      (memo, prop) => Object.assign(
        {},
        memo,
        Object.prototype.toString.call(obj[prop]) === "[object Object]"
          ? flatten(obj[prop], roots.concat([prop]), sep)
          : { [roots.concat([prop]).join(sep)]: obj[prop] }
      ),
      {}
    );
}

function formatValue(
  key: string,
  obj: any
): string {
  const placeholders = Array.from({ length: 9 }, (_value, index) => `{${index}}`);

  return typeof obj[key] === "function" ? obj[key](...placeholders) : obj[key];
}

const HTMLStr = fs.readFileSync(path.join(kProjectRootDir, "views", "index.html"), "utf-8");
const templateStr = zup(HTMLStr)({
  template: (obj, language) => flatten(kTokens[language][obj]),
  printKey: (key: string) => key,
  printValue: (key: string, obj: any) => formatValue(key, obj)
});

fs.writeFileSync(
  path.join(kProjectRootDir, "index.html"),
  templateStr
);
