// Import Node.js Dependencies
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

// Import Third-party Dependencies
import cacache from "cacache";
import lodashGet from "lodash.get";
import deepmerge from "deepmerge";

// Import Internal Dependencies
import { CACHE_PATH, CURRENT_LANG, type Languages } from "./constants.ts";
import { languages } from "./languages/index.ts";
import { taggedString } from "./utils.ts";

export const CONSTANTS = Object.seal({
  CACHE_PATH,
  CURRENT_LANG,
  LANG_UPDATED: true
});

export async function getLocalLang(): Promise<Languages> {
  if (CONSTANTS.LANG_UPDATED) {
    try {
      const { data } = await cacache.get(CACHE_PATH, "cli-lang");
      CONSTANTS.CURRENT_LANG = data.toString();
    }
    catch {
      await cacache.put(CACHE_PATH, "cli-lang", CURRENT_LANG);
      CONSTANTS.CURRENT_LANG = CURRENT_LANG;
    }
    CONSTANTS.LANG_UPDATED = false;
  }

  return CONSTANTS.CURRENT_LANG;
}

export interface SetLocalLangOptions {
  /** If true, calls getLocalLang() after setting and returns the language. */
  force?: boolean;
}

export async function setLocalLang(
  selectedLang: Languages,
  options?: SetLocalLangOptions
): Promise<Languages | void> {
  await cacache.put(CACHE_PATH, "cli-lang", selectedLang);
  CONSTANTS.LANG_UPDATED = true;

  if (options?.force) {
    return getLocalLang();
  }

  return undefined;
}

export async function getLanguages(): Promise<string[]> {
  const currentLang = await getLocalLang();

  const langs = Object.keys(languages);
  langs.splice(langs.indexOf(currentLang), 1);
  langs.unshift(currentLang);

  return langs;
}

export async function getToken(
  token: string,
  ...params: any[]
): Promise<string> {
  if (typeof token !== "string") {
    throw new TypeError("token must be a string");
  }

  const lang = await getLocalLang();
  if (!Reflect.has(languages, lang)) {
    throw new Error(`Invalid i18n lang -> ${lang}`);
  }

  const langToken = lodashGet(languages[lang], token);
  if (typeof langToken === "undefined" || langToken === null) {
    throw new Error(`Invalid i18n token -> ${token} for lang -> ${lang}`);
  }

  return params.length === 0 ? langToken : langToken(...params);
}

export function getTokenSync(
  token: string,
  ...params: any[]
): string {
  if (typeof token !== "string") {
    throw new TypeError("token must be a string");
  }

  if (CONSTANTS.LANG_UPDATED) {
    throw new Error("language has been updated, please run `await i18n.getLocalLang()` to make sure to use updated language");
  }

  const langToken = lodashGet(languages[CONSTANTS.CURRENT_LANG], token);
  if (typeof langToken === "undefined" || langToken === null) {
    throw new Error(`Invalid i18n token -> ${token} for lang -> ${CONSTANTS.CURRENT_LANG}`);
  }

  return params.length === 0 ? langToken : langToken(...params);
}

export function extend(
  extendLanguage: Languages,
  opts: Record<string, any> = {}
) {
  if (extendLanguage in languages) {
    languages[extendLanguage] = deepmerge(languages[extendLanguage], opts);
  }
  else {
    languages[extendLanguage] = opts;
  }
}

export async function extendFromSystemPath(
  languagesDirPath: string
): Promise<void> {
  if (!fs.existsSync(languagesDirPath)) {
    throw new Error(`The ${languagesDirPath} directory does not exist on this project.`);
  }
  const files = (fs.readdirSync(languagesDirPath, { withFileTypes: true }))
    .filter((dirent) => dirent.isFile() && path.extname(dirent.name) === ".js");

  for (const file of files) {
    const langName = path.basename(file.name, ".js");
    const fileLocation = path.join(languagesDirPath, file.name);

    const i18nTokensFile = await import(
      pathToFileURL(fileLocation).href
    );
    if ("default" in i18nTokensFile) {
      extend(langName, i18nTokensFile.default);
    }
  }
}

export { taggedString, type Languages };
