// Import Node.js Dependencies
import util from "util";

export function hasSomethingChanged(obj1, obj2, key) {
  if (util.isDeepStrictEqual(obj1[key], obj2[key])) {
    return false;
  }

  return true;
}
