// Import Node.js Dependencies
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import url from "node:url";
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
const kExternalI18nRepos = {
  scanner: "workspaces/scanner/src/i18n",
  cli: "i18n"
};
const kTaggedStringPath = url.pathToFileURL(path.join(import.meta.dirname, "../src/utils.js"));

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

for (const [repo, i18nPath] of Object.entries(kExternalI18nRepos)) {
  const frReq = await fetch(`https://raw.githubusercontent.com/NodeSecure/${repo}/refs/heads/master/${i18nPath}/french.js`);
  const frRaw = await frReq.text();
  const enReq = await fetch(`https://raw.githubusercontent.com/NodeSecure/${repo}/refs/heads/master/${i18nPath}/english.js`);
  const enRaw = await enReq.text();

  const tmpPathFr = path.join(os.tmpdir(), `fr-${repo}`);
  const tmpPathEn = path.join(os.tmpdir(), `en-${repo}`);
  fs.writeFileSync(tmpPathFr, frRaw.replace(`from "@nodesecure/i18n";`, `from "${kTaggedStringPath}"`));
  fs.writeFileSync(tmpPathEn, enRaw.replace(`from "@nodesecure/i18n";`, `from "${kTaggedStringPath}"`));

  const { default: fr } = await import(url.pathToFileURL(tmpPathFr).href);
  const { default: en } = await import(url.pathToFileURL(tmpPathEn).href);

  Object.assign(kTokens.french, { [repo]: fr[repo] });
  Object.assign(kTokens.english, { [repo]: en[repo] });
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
