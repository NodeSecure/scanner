// Import Node.js Dependencies
import util from "util";

export function compareDepVersions(str1, str2) {
  const [digitsOnly1, digitsOnly2] = [str1.slice(1), str1.slice(1)];
  const [digitsArr1, digitsArr2] = [digitsOnly1.split("."), digitsOnly2.split(".")];
  for (let i = 0; i < 3; i++) {
    const [digits1, digits2] = [parseInt(digitsArr1[i], 10), parseInt(digitsArr2[i], 10)];
    if (digit1 > digit2) {
      return {
        from: str1,
        to: str2,
        status: "up to date"
      };
    }
    else if (digit1 < digit2) {
      return {
        from: str1,
        to: str2,
        status: "outdated"
      };
    }
  }
}

export function hasSomethingChanged(obj1, obj2, key) {
  if (util.isDeepStrictEqual(obj1[key], obj2[key])) {
    return false;
  }

  return true;
}

export function upgradedDepsFromPackage1ToPackage2(obj1Deps, obj2Deps) {
  const upgrade = new Map();

  for (const key in obj1Deps) {
    if (Object.hasOwnProperty.call(obj2Deps, key)) {
      const element = obj2Deps[key];
    }
  }
}
