// Import Node.js Dependencies
import util from "util";

function getComparisonBetweenVersions(newStringVersion, oldStringVersion) {
  // We remove the '^' charater for deps versions
  let newDigitVersion;
  let oldDigitVersion;
  if (newStringVersion && oldStringVersion) {
    [newDigitVersion, oldDigitVersion] = [newStringVersion, oldStringVersion];
    if (newStringVersion.charAt(0) === "^" && oldStringVersion.charAt(0) === "^") {
      [newDigitVersion, oldDigitVersion] = [newStringVersion.slice(1), oldStringVersion.slice(1)];
    }
  }

  // Cases with new package on the new version that didn't exist on the old one
  // Or package in the old version that has been removed on the new version
  if (!oldStringVersion) {
    return {
      from: null,
      to: newStringVersion,
      status: "package added!"
    };
  }
  else if (!newStringVersion) {
    return {
      from: oldStringVersion,
      to: null,
      status: "package removed!"
    };
  }

  // Dealing with modified package version
  const [newOrderVersion, oldOrderVersion] = [newDigitVersion.split("."), oldDigitVersion.split(".")];
  for (let i = 0; i < 3; i++) {
    const [newDigit, oldDigit] = [parseInt(newOrderVersion[i], 10), parseInt(oldOrderVersion[i], 10)];
    if (newDigit > oldDigit) {
      return {
        from: oldStringVersion,
        to: newStringVersion,
        status: "package version increased!"
      };
    }
    else if (newDigit < oldDigit) {
      return {
        from: oldStringVersion,
        to: newStringVersion,
        status: "package version decreased!"
      };
    }
  }

  return null;
}
function compareDependencies(newDeps, oldDeps) {
  const changes = new Map();
  const depsKeys = getUniqueMergedKeys(newDeps, oldDeps);

  let change;

  for (const key of depsKeys) {
    if (!oldDeps) {
      change = getComparisonBetweenVersions(newDeps[key], null);
      changes.set(key, change);
    }
    else if (!newDeps) {
      change = getComparisonBetweenVersions(null, oldDeps[key]);
      changes.set(key, change);
    }
    else if (newDeps && oldDeps) {
      change = getComparisonBetweenVersions(newDeps[key], oldDeps[key]);
      if (change) {
        changes.set(key, change);
      }
    }
  }

  return changes.size > 0 ? changes : undefined;
}
function compareScripts(newScript, oldScript) {
  const changes = new Map();
  const scriptsKeys = getUniqueMergedKeys(newScript, oldScript);

  let change;

  for (const key of scriptsKeys) {
    // Cases without "scripts" fields
    if (!oldScript) {
      change = {
        from: null,
        to: newScript[key],
        status: "script added!"
      };
      changes.set(key, change);
      continue;
    }
    else if (!newScript) {
      change = {
        from: oldScript[key],
        to: null,
        status: "script removed!"
      };
      changes.set(key, change);
      continue;
    }

    // Cases with defined "scripts" field
    if (!oldScript[key]) {
      change = {
        from: null,
        to: newScript[key],
        status: "script added!"
      };
      changes.set(key, change);
    }
    else if (!newScript[key]) {
      change = {
        from: oldScript[key],
        to: null,
        status: "script removed!"
      };
      changes.set(key, change);
    }
    else if (newScript[key] && oldScript[key]) {
      if (!util.isDeepStrictEqual(newScript[key], oldScript[key])) {
        change = {
          from: oldScript[key],
          to: newScript[key],
          status: "script updated!"
        };

        changes.set(key, change);
      }
    }
  }

  return changes.size > 0 ? changes : undefined;
}
function compareEngines(newEngine, oldEngine) {
  const changes = new Map();
  const enginesKeys = getUniqueMergedKeys(newEngine, oldEngine);

  let change;

  for (const key of enginesKeys) {
    // Cases without "engines" fields
    if (!oldEngine) {
      change = {
        from: null,
        to: newEngine[key],
        status: "engine added!"
      };
      changes.set(key, change);
      continue;
    }
    else if (!newEngine) {
      change = {
        from: oldEngine[key],
        to: null,
        status: "engine removed!"
      };
      changes.set(key, change);
      continue;
    }

    // Cases with defined "engines" field
    if (!oldEngine[key]) {
      change = {
        from: null,
        to: newEngine[key],
        status: "engine added!"
      };
      changes.set(key, change);
    }
    else if (!newEngine[key]) {
      change = {
        from: oldEngine[key],
        to: null,
        status: "engine removed!"
      };
      changes.set(key, change);
    }
    else if (newEngine[key] && oldEngine[key]) {
      if (!util.isDeepStrictEqual(newEngine[key], oldEngine[key])) {
        change = {
          from: oldEngine[key],
          to: newEngine[key],
          status: "engine updated!"
        };

        changes.set(key, change);
      }
    }
  }

  return changes.size > 0 ? changes : undefined;
}
function compareTypes(newType, oldType) {
  let change;

  // Cases without "types" fields
  switch (oldType) {
    case undefined:
      if (newType === "module") {
        change = {
          from: "commonjs",
          to: newType,
          status: "type switched!"
        };
      }
      break;
    case "commonjs":
      if (newType === "module") {
        change = {
          from: "commonjs",
          to: newType,
          status: "type switched!"
        };
      }
      break;
    case "module":
      if (!newType || newType === "commonjs") {
        change = {
          from: "module",
          to: "commonjs",
          status: "type switched!"
        };
      }
      break;
    default:
      break;
  }

  return change;
}

export function getUniqueMergedKeys(newObj, oldObj) {
  let newObjKeys;
  let oldObjKeys;

  if (newObj && oldObj) {
    [newObjKeys, oldObjKeys] = [Object.keys(newObj), Object.keys(oldObj)];
  }
  if (!newObj) {
    [newObjKeys, oldObjKeys] = [[], Object.keys(oldObj)];
  }
  if (!oldObj) {
    [newObjKeys, oldObjKeys] = [Object.keys(newObj), []];
  }

  const objKeys = newObjKeys.concat(oldObjKeys);

  for (let i = 0; i < objKeys.length; i++) {
    for (let j = i + 1; j < objKeys.length; j++) {
      if (objKeys[i] === objKeys[j]) {
        objKeys.splice(j--, 1);
      }
    }
  }

  return objKeys;
}

export function hasSomethingChanged(newObj, oldObj, key) {
  let change;

  switch (key) {
    case "version":
      change = getComparisonBetweenVersions(newObj[key], oldObj[key]);
      change = change ? change : undefined;
      break;
    case "engines":
      change = compareEngines(newObj[key], oldObj[key]);
      break;
    case "scripts":
      change = compareScripts(newObj[key], oldObj[key]);
      break;
    case "devDependencies":
      change = compareDependencies(newObj[key], oldObj[key]);
      break;
    case "dependencies":
      change = compareDependencies(newObj[key], oldObj[key]);
      break;
    case "type":
      change = compareTypes(newObj[key], oldObj[key]);
      break;
    default:
      break;
  }

  return change;
}
