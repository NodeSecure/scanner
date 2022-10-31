// Import Node.js Dependencies
import util from "util";

function getComparisonBetweenVersions(newStringVersion, oldStringVersion) {
  // We remove the '^' charater for deps versions
  let [newDigitVersion, oldDigitVersion] = [newStringVersion, oldStringVersion];
  if (newStringVersion.charAt(0) === "^" && oldStringVersion.charAt(0) === "^") {
    [newDigitVersion, oldDigitVersion] = [newStringVersion.slice(1), oldStringVersion.slice(1)];
  }

  // Cases with new package on the new version that didn't exist on the old one
  // Or package in the old version that has been removed on the new version
  if (!oldStringVersion) {
    return {
      from: undefined,
      to: newStringVersion,
      status: "package added!"
    };
  }
  else if (!newStringVersion) {
    return {
      from: oldStringVersion,
      to: undefined,
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
    change = getComparisonBetweenVersions(newDeps[key], oldDeps[key]);
    if (change) {
      changes.set(key, change);
    }
  }
}

export function getUniqueMergedKeys(newObj, oldObj) {
  const [newObjKeys, oldObjKeys] = [Object.keys(newObj), Object.keys(oldObj)];
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
  if (util.isDeepStrictEqual(newObj[key], oldObj[key])) {
    return false;
  }

  return true;
}
