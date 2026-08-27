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
import type { Contact, Packument } from "@nodesecure/npm-types";
import { getNpmRegistryURL } from "@nodesecure/npm-registry-sdk";

// Import Internal Dependencies
import { TopPackages } from "../class/TopPackages.class.ts";
import type {
  BinConfusion, BinConfusionWarning, Dependency,
  GlobalWarning, NpxConfusion, NpxConfusionWarning
} from "../types.ts";
import { hasStatusCode } from "./index.ts";

await i18n.extendFromSystemPath(
  path.join(import.meta.dirname, "..", "i18n")
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

type GetNpxAndBinConfusionWarningParams = {
  packument: (name: string, options?: {
    registry: string;
    token?: string;
  }) => Promise<Packument>;
  getToken: (token: string, ...params: any[]) => Promise<string>;
  token: string | undefined;
  npxConfusions: Map<string, NpxConfusion[]>;
  binConfusions: Map<string, BinConfusion[]>;
};

const kNotFoundStatusCode = 404;

export async function getNpxAndBinConfusionWarnings({
  packument,
  getToken,
  token,
  npxConfusions,
  binConfusions }: GetNpxAndBinConfusionWarningParams) {
  const operationQueue: Promise<void>[] = [];

  const warnings: (BinConfusionWarning | NpxConfusionWarning)[] = [];

  const seenPromises = new Map<string, Promise<Packument>>();

  for (const [npxBinaryName, packages] of npxConfusions.entries()) {
    for (const { version, name, scriptName } of packages) {
      const spec = `${name}@${version}`;

      let packumentPromise: Promise<Packument>;

      if (seenPromises.has(npxBinaryName)) {
        packumentPromise = seenPromises.get(npxBinaryName)!;
      }
      else {
        packumentPromise = packument(npxBinaryName, {
          registry: getNpmRegistryURL(),
          token
        });
        seenPromises.set(npxBinaryName, packumentPromise);
      }

      operationQueue.push(
        packumentPromise.then(async() => {
          warnings.push({
            type: "npx-confusion",
            message: await getToken("scanner.npx_confusion_claimed", npxBinaryName, scriptName, spec),
            metadata: {
              version,
              name,
              npxBinaryName,
              scriptName
            }
          });
        }).catch(async(err) => {
          if (hasStatusCode(err) && err.statusCode === kNotFoundStatusCode) {
            warnings.push({
              type: "npx-confusion",
              message: await getToken("scanner.npx_confusion_unclaimed", npxBinaryName, scriptName, spec),
              metadata: {
                version,
                name,
                npxBinaryName,
                scriptName
              }
            });
          }
        })

      );
    }
  }

  for (const [binName, packages] of binConfusions.entries()) {
    for (const { version, name } of packages) {
      const spec = `${name}@${version}`;

      let packumentPromise: Promise<Packument>;

      if (seenPromises.has(binName)) {
        packumentPromise = seenPromises.get(binName)!;
      }
      else {
        packumentPromise = packument(binName, {
          registry: getNpmRegistryURL(),
          token
        });
        seenPromises.set(binName, packumentPromise);
      }

      operationQueue.push(
        packumentPromise.then(async() => {
          warnings.push({
            type: "bin-confusion",
            message: await getToken("scanner.bin_confusion_claimed", binName, spec),
            metadata: {
              version,
              name,
              binaryName: binName
            }
          });
        }).catch(async(err) => {
          if (hasStatusCode(err) && err.statusCode === kNotFoundStatusCode) {
            warnings.push({
              type: "bin-confusion",
              message: await getToken("scanner.bin_confusion_unclaimed", binName, spec),
              metadata: {
                version,
                name,
                binaryName: binName
              }
            });
          }
        })

      );
    }
  }

  await Promise.allSettled(operationQueue);

  return warnings;
}
