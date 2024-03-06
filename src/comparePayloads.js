export function comparePayloads(payload, comparedPayload) {
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

  return {
    title: `'${payload.rootDependencyName}' -> '${comparedPayload.rootDependencyName}'`,
    flaggedAuthors: arrayOfObjectsDiffByKey("name", payload.flaggedAuthors, comparedPayload.flaggedAuthors),
    warnings: arrayDiff(payload.warnings, comparedPayload.warnings),
    scannerVersion: compareValues(payload.scannerVersion, comparedPayload.scannerVersion),
    vulnerabilityStrategy: compareValues(payload.vulnerabilityStrategy, comparedPayload.vulnerabilityStrategy),
    dependencies: compareDependencies(payload.dependencies, comparedPayload.dependencies)
  };
}

function compareDependencies(original, toCompare) {
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

function compareVersions(original, toCompare) {
  const { comparable, ...versions } = dictionariesDiff(original, toCompare);

  const comparedVersions = new Map();
  for (const [name, [version, comparedVersion]] of comparable) {
    const diff = {
      id: compareValues(version.id, comparedVersion.id),
      size: compareValues(version.size, comparedVersion.size),
      usedBy: compareDictionnaries(version.usedBy, comparedVersion.usedBy),
      devDependency: compareValues(version.isDevDependency, comparedVersion.isDevDependency),
      existOnRemoteRegistry: compareValues(version.existOnRemoteRegistry, comparedVersion.existOnRemoteRegistry),
      description: compareValues(version.description, comparedVersion.description),
      author: compareObjects("name", version.author, comparedVersion.author),
      engines: compareDictionnaries(version.engines, comparedVersion.engines),
      repository: compareObjects("type", version.repository, comparedVersion.repository)
        ?? compareObjects("url", version.repository, comparedVersion.repository),
      scripts: compareDictionnaries(version.scripts, comparedVersion.scripts),
      warnings: arrayDiff(version.warnings, comparedVersion.warnings),
      composition: compareComposition(version.composition, comparedVersion.composition),
      licenseIds: arrayDiff(version.license.uniqueLicenseIds, comparedVersion.license.uniqueLicenseIds),
      flags: arrayDiff(version.flags, comparedVersion.flags),
      links: compareValues(version.links, comparedVersion.links)
    };

    comparedVersions.set(name, diff);
  }

  return {
    compared: comparedVersions,
    ...versions
  };
}

function compareComposition(original = {}, toCompare = {}) {
  return {
    minified: arrayDiff(original.minified, toCompare.minified),
    required_thirdparty: arrayDiff(original.required_thirdparty, toCompare.required_thirdparty),
    required_nodejs: arrayDiff(original.required_nodejs, toCompare.required_nodejs),
    unused: arrayDiff(original.unused, toCompare.unused),
    missing: arrayDiff(original.missing, toCompare.missing)
  };
}

function compareDictionnaries(original, toCompare) {
  const { comparable, ...diff } = dictionariesDiff(original, toCompare);

  const compared = new Map();
  for (const [name, [entity, comparedEntity]] of comparable) {
    compared.set(name, compareValues(entity, comparedEntity));
  }

  return {
    compared,
    ...diff
  };
}

function compareObjects(key, original = {}, toCompare = {}) {
  if (original[key] === toCompare[key]) {
    return undefined;
  }

  return {
    prev: original,
    now: toCompare
  };
}

function compareValues(original, toCompare) {
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

function dictionariesDiff(original = {}, toCompare = {}) {
  const added = new Map();
  const removed = new Map();
  const comparable = new Map();

  Object.keys(original).forEach((key) => {
    if (Object.hasOwn(toCompare, key)) {
      comparable.set(key, [original[key], toCompare[key]]);
    }
    else {
      removed.set(key, original[key]);
    }
  });

  Object.keys(toCompare).forEach((key) => {
    if (!Object.hasOwn(original, key)) {
      added.set(key, toCompare[key]);
    }
  });

  return { added, removed, comparable };
}

function arrayDiff(original = [], toCompare = []) {
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

export function arrayOfObjectsDiffByKey(key, original = [], toCompare = []) {
  const toCompareMap = new Map(toCompare.map((item) => [item[key], item]));
  const originalMap = new Map(original.map((item) => [item[key], item]));

  const added = toCompare.filter((item) => !originalMap.has(item[key]));
  const removed = original.filter((item) => !toCompareMap.has(item[key]));

  return { added, removed };
}
