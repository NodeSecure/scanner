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
    warnings: compareWarnings(payload.warnings, comparedPayload.warnings),
    dependencies: compareDependencies(payload.dependencies, comparedPayload.dependencies)
  };
}

function compareWarnings(original, toCompare) {
  const removed = original.filter((o, k) => JSON.stringify(o) !== JSON.stringify(toCompare[k]));
  const added = toCompare.filter((o, k) => JSON.stringify(o) !== JSON.stringify(original[k]));

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
      publishers: arrayDiff("name", dep.metadata.publishers, comparedDep.metadata.publishers),
      maintainers: arrayDiff("name", dep.metadata.maintainers, comparedDep.metadata.maintainers),
      versions: compareVersions(dep.versions, comparedDep.versions)
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
      author: objectDiff("name", version.author, comparedVersion.author),
      engines: compareEngines(version.engines, comparedVersion.engines),
      warnings: compareWarnings(version.warnings, comparedVersion.warnings)
    };

    comparedVersions.set(name, diff);
  }

  return {
    compared: comparedVersions,
    ...versions
  };
}

function compareEngines(original, toCompare) {
  const { comparable, ...diff } = collectionObjectDiff(original, toCompare);

  const comparedEngines = new Map();
  for (const [name, [engine, comparedEngine]] of comparable) {
    comparedEngines.set(name, valueDiff(engine, comparedEngine));
  }

  return {
    compared: comparedEngines,
    ...diff
  };
}

function collectionObjectDiff(original, toCompare) {
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

function arrayDiff(key, original, toCompare) {
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

function objectDiff(key, original, toCompare) {
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
