// Import Node.js Dependencies
import path from "node:path";

// Import Third-party Dependencies
import * as i18n from "@nodesecure/i18n";
import * as RC from "@nodesecure/rc";
import {
  ContactExtractor,
  type IlluminatedContact,
  type ContactExtractorPackageMetadata
} from "@nodesecure/contact";
import type { Contact } from "@nodesecure/npm-types";

// Import Internal Dependencies
import { getDirNameFromUrl } from "./dirname.js";
import { TopPackages } from "../class/TopPackages.class.js";
import type { Dependency, GlobalWarning } from "../types.js";

await i18n.extendFromSystemPath(
  path.join(getDirNameFromUrl(import.meta.url), "..", "i18n")
);

// CONSTANTS
const kDetectedDep = i18n.taggedString`The dependency '${0}' has been detected in the dependency Tree.`;
const kDefaultIlluminatedContacts: Contact[] = [
  {
    name: "marak",
    email: "marak.squires@gmail.com"
  }
];

const kDependencyWarnMessage = {
  "@scarf/scarf": await i18n.getToken("scanner.disable_scarf"),
  iohook: await i18n.getToken("scanner.keylogging")
} as const;

export interface GetWarningsResult {
  warnings: GlobalWarning[];
  illuminated: IlluminatedContact[];
}

export async function getDependenciesWarnings(
  dependenciesMap: Map<string, Dependency>,
  highlightContacts: Contact[] = [],
  isLocalScan = false
): Promise<GetWarningsResult> {
  const vulnerableDependencyNames = Object.keys(
    kDependencyWarnMessage
  ) as unknown as (keyof typeof kDependencyWarnMessage)[];
  const topPackages = new TopPackages();
  await topPackages.loadJSON();

  const warnings: GlobalWarning[] = vulnerableDependencyNames
    .flatMap((name) => {
      if (!dependenciesMap.has(name)) {
        return [];
      }

      return {
        type: "dangerous-dependency",
        message: `${kDetectedDep(name)} ${kDependencyWarnMessage[name]}`
      };
    });

  const dependencies: Record<string, ContactExtractorPackageMetadata> = Object.create(null);
  for (const [packageName, dependency] of dependenciesMap) {
    const { author, maintainers } = dependency.metadata;

    const warning = await (
      isLocalScan ?
        Promise.resolve(null) :
        searchTypoSquattingByName(topPackages, packageName)
    );
    if (warning !== null) {
      warnings.push(warning);
    }

    dependencies[packageName] = {
      maintainers,
      ...(author === null ? {} : { author })
    };
  }

  const memoizedConfig = RC.memoized();
  const extractor = new ContactExtractor({
    highlight: [
      ...highlightContacts,
      ...(memoizedConfig === null ?
        [] : (memoizedConfig.scanner?.highlight?.contacts ?? [])
      ),
      ...kDefaultIlluminatedContacts
    ]
  });
  const { illuminated } = await extractor.fromDependencies(
    dependencies
  );

  return {
    warnings,
    illuminated
  };
}

async function searchTypoSquattingByName(
  topPackages: TopPackages,
  packageName: string
): Promise<GlobalWarning | null> {
  const similarPackages = topPackages.getSimilarPackages(packageName);
  if (
    similarPackages.length > 0 &&
    similarPackages.length <= 3
  ) {
    const warningMessage = await i18n.getToken(
      "scanner.typo_squatting",
      packageName,
      similarPackages.join(", ")
    );

    return {
      type: "typo-squatting",
      message: warningMessage,
      metadata: {
        name: packageName,
        similar: similarPackages
      }
    };
  }

  return null;
}
