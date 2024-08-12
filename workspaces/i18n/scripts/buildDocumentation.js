// Import Node.js Dependencies
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

// Import Third-party Dependencies
import zup from "zup";

// Import Internal Dependencies
import { english } from "../languages/english.js";
import { french } from "../languages/french.js";


// CONSTANTS
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const kProjectRootDir = path.join(__dirname, "..");
const kTokens = {
  english,
  french
};

function flatten(obj, roots = [], sep = ".") {
  return Object.keys(obj).reduce(
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

function formatValue(props, obj) {
  const placeholders = Array.from({ length: 9 }, (value, index) => `{${index}}`);

  return typeof obj[props] === "function" ? obj[props](...placeholders) : obj[props];
}

const HTMLStr = fs.readFileSync(path.join(kProjectRootDir, "views", "index.html"), "utf-8");
const templateStr = zup(HTMLStr)({
  template: (obj, language) => flatten(kTokens[language][obj]),
  printKey: (props) => props,
  printValue: (props, obj) => formatValue(props, obj)
});

fs.writeFileSync(path.join(kProjectRootDir, "index.html"), templateStr);
