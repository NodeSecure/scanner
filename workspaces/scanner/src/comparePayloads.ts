// Import Third-party Dependencies
import type { Warning } from "@nodesecure/js-x-ray";
import * as Vulnera from "@nodesecure/vulnera";

// Import Internal Dependencies
import type {
  Payload,
  Dependencies,
  Dependency,
  DependencyVersion,
  Publisher,
  Maintainer,
  Repository,
  DependencyLinks
} from "./types.js";

export interface PayloadComparison {
  title: string;
  warnings: ArrayDiff<string>;
  scannerVersion: ValueComparison<string>;
  vulnerabilityStrategy: ValueComparison<string>;
  dependencies: DependenciesComparison;
}

export interface DependenciesComparison {
  compared: Map<string, DependencyComparison>;
  added: Map<string, Dependency>;
  removed: Map<string, Dependency>;
}

export interface DependencyComparison {
  publishers: ArrayDiff<Publisher>;
  maintainers: ArrayDiff<Maintainer>;
  versions: VersionsComparisonResult;
  vulnerabilities: ArrayDiff<Vulnera.StandardVulnerability>;
}

export interface VersionsComparisonResult {
  compared: Map<string, DependencyVersionComparison>;
  added: Map<string, DependencyVersion>;
  removed: Map<string, DependencyVersion>;
}

export interface DependencyVersionComparison {
  id: ValueComparison<number>;
  size: ValueComparison<number>;
  usedBy: DictionaryComparison<string>;
  isDevDependency: ValueComparison<boolean>;
  existOnRemoteRegistry: ValueComparison<boolean>;
  description: ValueComparison<string>;
  author: ValueComparison<Maintainer>;
  engines: DictionaryComparison<string>;
  repository: ValueComparison<Repository>;
  scripts: DictionaryComparison<string>;
  warnings: ArrayDiff<Warning>;
  composition: CompositionComparison;
  uniqueLicenseIds: ArrayDiff<string>;
  flags: ArrayDiff<string>;
  links: ValueComparison<DependencyLinks>;
}

export interface DictionaryComparison<T> {
  compared: Map<string, ValueComparison<T>>;
  added: Map<string, T>;
  removed: Map<string, T>;
}

export interface CompositionComparison {
  minified: ArrayDiff<string>;
  required_thirdparty: ArrayDiff<string>;
  required_nodejs: ArrayDiff<string>;
  unused: ArrayDiff<string>;
  missing: ArrayDiff<string>;
}

export type ValueComparison<T> = {
  prev: T;
  now: T;
} | undefined;

export interface ArrayDiff<T> {
  added: T[];
  removed: T[];
}

export function comparePayloads(
  payload: Payload,
  comparedPayload: Payload
): PayloadComparison {
  if (payload.id === comparedPayload.id) {
    throw new Error(
      `You try to compare two payloads with the same id '${payload.id}'`
    );
  }

  if (payload.rootDependencyName !== comparedPayload.rootDependencyName) {
    throw new Error(
      `You can't compare different package payloads '${payload.rootDependencyName}' and '${comparedPayload.rootDependencyName}'`
    );
  }

  const givenVersion = Object.keys(payload.dependencies[payload.rootDependencyName].versions)[0];
  const comparedVersion = Object.keys(comparedPayload.dependencies[comparedPayload.rootDependencyName].versions)[0];

  return {
    title: `'${payload.rootDependencyName}@${givenVersion}' -> '${comparedPayload.rootDependencyName}@${comparedVersion}'`,
    warnings: arrayDiff(
      payload.warnings,
      comparedPayload.warnings
    ),
    scannerVersion: compareValues(
      payload.scannerVersion,
      comparedPayload.scannerVersion
    ),
    vulnerabilityStrategy: compareValues(
      payload.vulnerabilityStrategy,
      comparedPayload.vulnerabilityStrategy
    ),
    dependencies: compareDependencies(
      payload.dependencies,
      comparedPayload.dependencies
    )
  };
}

function compareDependencies(
  original: Dependencies,
  toCompare: Dependencies
) {
  const {
    comparable,
    ...dependencies
  } = dictionariesDiff(original, toCompare);

  const comparedDependencies = new Map();
  for (const [name, [dep, comparedDep]] of comparable) {
    const diff = {
      publishers: arrayOfObjectsDiffByKey("name", dep.metadata.publishers, comparedDep.metadata.publishers),
      maintainers: arrayOfObjectsDiffByKey("name", dep.metadata.maintainers, comparedDep.metadata.maintainers),
      versions: compareVersions(dep.versions, comparedDep.versions),
      vulnerabilities: arrayOfObjectsDiffByKey("id", dep.vulnerabilities, comparedDep.vulnerabilities)
    };

    comparedDependencies.set(name, diff);
  }

  return { compared: comparedDependencies, ...dependencies };
}

function compareVersions(
  original: Record<string, DependencyVersion>,
  toCompare: Record<string, DependencyVersion>
): VersionsComparisonResult {
  const { comparable, ...versions } = dictionariesDiff(original, toCompare);

  const comparedVersions = new Map<string, DependencyVersionComparison>();
  for (const [name, [version, comparedVersion]] of comparable) {
    const diff: DependencyVersionComparison = {
      id: compareValues(version.id, comparedVersion.id),
      size: compareValues(version.size, comparedVersion.size),
      usedBy: compareDictionnaries(version.usedBy, comparedVersion.usedBy),
      isDevDependency: compareValues(version.isDevDependency, comparedVersion.isDevDependency),
      existOnRemoteRegistry: compareValues(version.existOnRemoteRegistry, comparedVersion.existOnRemoteRegistry),
      description: compareValues(version.description, comparedVersion.description),
      author: version.author && comparedVersion.author ? compareObjects("name", version.author, comparedVersion.author) : void 0,
      // @ts-ignore
      engines: compareDictionnaries(version.engines, comparedVersion.engines),
      // FIXME: repository can be a string: https://github.com/pillarjs/encodeurl/blob/master/package.json#L14
      repository: compareObjects("type", version.repository, comparedVersion.repository)
      ?? compareObjects("url", version.repository, comparedVersion.repository),
      scripts: compareDictionnaries(version.scripts, comparedVersion.scripts),
      warnings: arrayDiff(version.warnings, comparedVersion.warnings),
      composition: compareComposition(version.composition, comparedVersion.composition),
      uniqueLicenseIds: arrayDiff(version.uniqueLicenseIds, comparedVersion.uniqueLicenseIds),
      flags: arrayDiff(version.flags, comparedVersion.flags),
      links: compareValues(version.links!, comparedVersion.links!)
    };

    comparedVersions.set(name, diff);
  }

  return {
    compared: comparedVersions,
    ...versions
  };
}

function compareComposition(
  original: DependencyVersion["composition"],
  toCompare: DependencyVersion["composition"]
): CompositionComparison {
  return {
    minified: arrayDiff(original.minified, toCompare.minified),
    required_thirdparty: arrayDiff(original.required_thirdparty, toCompare.required_thirdparty),
    required_nodejs: arrayDiff(original.required_nodejs, toCompare.required_nodejs),
    unused: arrayDiff(original.unused, toCompare.unused),
    missing: arrayDiff(original.missing, toCompare.missing)
  };
}

function compareDictionnaries<K extends string | number | symbol, V>(
  original: Record<K, V>,
  toCompare: Record<K, V>
): DictionaryComparison<V> {
  const { comparable, ...diff } = dictionariesDiff(original, toCompare);

  const compared = new Map<string, ValueComparison<V>>();
  for (const [name, [entity, comparedEntity]] of comparable) {
    compared.set(name, compareValues(entity, comparedEntity));
  }

  return {
    compared,
    ...diff
  };
}

function compareObjects<T extends object>(
  key: keyof T,
  original: T = Object.create(null),
  toCompare: T = Object.create(null)
): ValueComparison<T> {
  if (original[key] === toCompare[key]) {
    return undefined;
  }

  return {
    prev: original,
    now: toCompare
  };
}

function compareValues<T>(
  original: T,
  toCompare: T
): ValueComparison<T> {
  if (typeof original === "object") {
    if (JSON.stringify(original) === JSON.stringify(toCompare)) {
      return undefined;
    }
  }
  else if (original === toCompare) {
    return undefined;
  }

  return {
    prev: original,
    now: toCompare
  };
}

function dictionariesDiff<T>(
  original: Record<string, T> = {},
  toCompare: Record<string, T> = {}
) {
  const added = new Map<string, T>();
  const removed = new Map<string, T>();
  const comparable = new Map<string, [T, T]>();

  Object.keys(original).forEach((key) => {
    if (key in toCompare) {
      comparable.set(key, [original[key], toCompare[key]]);
    }
    else {
      removed.set(key, original[key]);
    }
  });

  Object.keys(toCompare).forEach((key) => {
    if (!(key in original)) {
      added.set(key, toCompare[key]);
    }
  });

  return { added, removed, comparable };
}

function arrayDiff<T>(
  original: T[] = [],
  toCompare: T[] = []
): ArrayDiff<T> {
  const added = toCompare.filter((v, i) => {
    if (typeof v !== "object") {
      return v !== original[i];
    }

    return JSON.stringify(v) !== JSON.stringify(original[i]);
  });

  const removed = original.filter((v, i) => {
    if (typeof v !== "object") {
      return v !== toCompare[i];
    }

    return JSON.stringify(v) !== JSON.stringify(toCompare[i]);
  });

  return { added, removed };
}

export function arrayOfObjectsDiffByKey<T extends Record<string, any>>(
  key: string,
  original: T[] = [],
  toCompare: T[] = []
): ArrayDiff<T> {
  const toCompareMap = new Map(toCompare.map((item) => [item[key], item]));
  const originalMap = new Map(original.map((item) => [item[key], item]));

  const added = toCompare.filter((item) => !originalMap.has(item[key]));
  const removed = original.filter((item) => !toCompareMap.has(item[key]));

  return { added, removed };
}
