// Import Node.js Dependencies
import path from "node:path";

// Import Third-party Dependencies
import * as i18n from "@nodesecure/i18n";
import { extractAllAuthors, type extractedAuthor } from "@nodesecure/authors";

// Import Internal Dependencies
import { getDirNameFromUrl } from "./dirname.js";

await i18n.extendFromSystemPath(
  path.join(getDirNameFromUrl(import.meta.url), "..", "i18n")
);

// CONSTANTS
const kDetectedDep = i18n.taggedString`The dependency '${0}' has been detected in the dependency Tree.`;
const kFlaggedAuthors = [{
  name: "marak",
  email: "marak.squires@gmail.com"
}];
const kDependencyWarnMessage = Object.freeze({
  "@scarf/scarf": await i18n.getToken("scanner.disable_scarf"),
  iohook: await i18n.getToken("scanner.keylogging")
});

export interface GetWarningsResult {
  warnings: string[];
  flaggedAuthors: extractedAuthor[];
}

export async function getDependenciesWarnings(
  dependenciesMap: Map<string, any>
): Promise<GetWarningsResult> {
  const warnings = [...Object.keys(kDependencyWarnMessage)]
    .filter((depName) => dependenciesMap.has(depName))
    // @ts-ignore
    .map((depName) => `${kDetectedDep(depName)} ${kDependencyWarnMessage[depName]}`);

  // TODO: add support for RC configuration
  const res = await extractAllAuthors(
    { dependencies: Object.fromEntries(dependenciesMap) },
    { flags: kFlaggedAuthors, domainInformations: false }
  );

  return {
    warnings,
    flaggedAuthors: res.flaggedAuthors
  };
}
