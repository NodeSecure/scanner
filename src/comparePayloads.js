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
    flaggedAuthors: arrayObjectDiff("name", payload.flaggedAuthors, comparedPayload.flaggedAuthors),
    warnings: arrayLiteralDiff(payload.warnings, comparedPayload.warnings),
    scannerVersion: valueDiff(payload.scannerVersion, comparedPayload.scannerVersion),
    vulnerabilityStrategy: valueDiff(payload.vulnerabilityStrategy, comparedPayload.vulnerabilityStrategy),
    dependencies: compareDependencies(payload.dependencies, comparedPayload.dependencies)
  };
}

function arrayLiteralDiff(original = [], toCompare = []) {
  const added = toCompare.filter((v, i) => v !== original[i]);
  const removed = original.filter((v, i) => v !== toCompare[i]);

  return { added, removed };
}

function compareDependencies(original, toCompare) {
  const {
    comparable,
    ...dependencies
  } = collectionObjectDiff(original, toCompare);

  const comparedDependencies = new Map();
  for (const [name, [dep, comparedDep]] of comparable) {
    const diff = {
      publishers: arrayObjectDiff("name", dep.metadata.publishers, comparedDep.metadata.publishers),
      maintainers: arrayObjectDiff("name", dep.metadata.maintainers, comparedDep.metadata.maintainers),
      versions: compareVersions(dep.versions, comparedDep.versions),
      vulnerabilities: arrayObjectDiff("id", dep.vulnerabilities, comparedDep.vulnerabilities)
    };

    comparedDependencies.set(name, diff);
  }

  return { compared: comparedDependencies, ...dependencies };
}

function compareVersions(original, toCompare) {
  const { comparable, ...versions } = collectionObjectDiff(original, toCompare);

  const comparedVersions = new Map();
  for (const [name, [version, comparedVersion]] of comparable) {
    const diff = {
      usedBy: collectionObjectDiff(version.usedBy, comparedVersion.usedBy),
      devDependency: valueDiff(version.isDevDependency, comparedVersion.isDevDependency),
      existOnRemoteRegistry: valueDiff(version.existOnRemoteRegistry, comparedVersion.existOnRemoteRegistry),
      description: valueDiff(version.description, comparedVersion.description),
      author: objectDiff("name", version.author, comparedVersion.author),
      engines: compareCollectionObjectDiff(version.engines, comparedVersion.engines),
      repository: objectDiff("type", version.repository, comparedVersion.repository)
        ?? objectDiff("url", version.repository, comparedVersion.repository),
      scripts: compareCollectionObjectDiff(version.scripts, comparedVersion.scripts),
      warnings: diffSnapShotArray(version.warnings, comparedVersion.warnings),
      licenseIds: arrayLiteralDiff(version.license.uniqueLicenseIds, comparedVersion.license.uniqueLicenseIds),
      flags: arrayLiteralDiff(version.flags, comparedVersion.flags),
      links: compareSnapShot(version.links, comparedVersion.links)
    };

    console.log(diff.links);

    comparedVersions.set(name, diff);
  }

  return {
    compared: comparedVersions,
    ...versions
  };
}

function compareCollectionObjectDiff(original, toCompare) {
  const { comparable, ...diff } = collectionObjectDiff(original, toCompare);

  const compared = new Map();
  for (const [name, [entity, comparedEntity]] of comparable) {
    compared.set(name, valueDiff(entity, comparedEntity));
  }

  return {
    compared,
    ...diff
  };
}

function diffSnapShotArray(original = [], toCompare = []) {
  const removed = original.filter((o, k) => JSON.stringify(o) !== JSON.stringify(toCompare[k]));
  const added = toCompare.filter((o, k) => JSON.stringify(o) !== JSON.stringify(original[k]));

  return { added, removed };
}

function compareSnapShot(original = {}, toCompare = {}) {
  if (JSON.stringify(original) === JSON.stringify(toCompare)) {
    return undefined;
  }

  return { prev: original, now: toCompare };
}

function collectionObjectDiff(original = {}, toCompare = {}, withValueDiff = false) {
  const comparable = new Map();
  const removed = new Map();
  for (const name in original) {
    if (!Object.hasOwn(original, name)) {
      continue;
    }

    if (Object.hasOwn(toCompare, name)) {
      comparable.set(name, [original[name], toCompare[name]]);
    }
    else {
      removed.set(name, original[name]);
    }
  }

  const added = new Map();
  for (const name in toCompare) {
    if (!Object.hasOwn(toCompare, name)) {
      continue;
    }

    if (!Object.hasOwn(original, name)) {
      added.set(name, toCompare[name]);
    }
  }

  return { comparable, added, removed };
}

function arrayObjectDiff(key, original = [], toCompare = []) {
  const removed = [];
  for (const obj of original) {
    const comparedObj = toCompare.find((o) => o[key] === obj[key]);
    if (!comparedObj) {
      removed.push(obj);
    }
  }

  const added = [];
  for (const comparedObj of toCompare) {
    const obj = original.find((o) => o[key] === comparedObj[key]);
    if (!obj) {
      added.push(comparedObj);
    }
  }

  return { added, removed };
}

function objectDiff(key, original = {}, toCompare = {}) {
  if (original[key] === toCompare[key]) {
    return undefined;
  }

  return {
    prev: original,
    now: toCompare
  };
}

function valueDiff(original, toCompare) {
  if (original === toCompare) {
    return undefined;
  }

  return {
    prev: original,
    now: toCompare
  };
}
