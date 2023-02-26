// Import Node.js Dependencies
import util from "util";


/**
 * We a going to consider the @payload as a tree
 * and then @walk through it in an @infixed manner
 * to appy these processes in different types of nodes
 */

// Processes
function getCurrentNode(node) {
  if (['number', 'string', 'boolean', 'undefined'].includes(typeof(node)) || node === null) {
    // case current node is primitive type
    return [{}, 'leaf'];
  }
  else if (node instanceof Array) {
    // case current node is an Array
    if (node.length === 0) {
      // with no element
      return [
        { length: 0 },
        'leaf'
      ];
    }

    let firstItem = node[0];
    if (['number', 'string', 'boolean', 'undefined'].includes(typeof(firstItem)) || firstItem === null) {
      // of primitives
      return [
        { length: node.length },
        'leaf'
      ];
    }
    else {
      // of Objects
      let obj = {};
      let objItem = 0;
      for (const item of node) {
        obj['array-item-' + objItem++] = item;
      }

      return [obj, 'node'];
    }
  }
  else { // if (node instanceof Object)
    // case current node is an Object
    return [node, 'node']
  }
}

// Helpers
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

  // delete duplicates keys
  for (let i = 0; i < objKeys.length; i++) {
    for (let j = i + 1; j < objKeys.length; j++) {
      if (objKeys[i] === objKeys[j]) {
        objKeys.splice(j--, 1);
      }
    }
  }

  return objKeys.sort();
}

// Deep-walk
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

export function infixedDeepWalk(newObj, oldObj, globalChanges) {
  let nodes = getUniqueMergedKeys(newObj, oldObj);

  for (const key of nodes) {
    const [newCurrentObj, newStatusNode] = getCurrentNode(newObj[key]);
    const [oldCurrentObj, oldStatusNode] = getCurrentNode(oldObj[key]);

    console.log(newStatusNode + ' ' + key);

    if (!util.isDeepStrictEqual(newCurrentObj, oldCurrentObj)) {
      if(!globalChanges.get(key) && newStatusNode === 'node') {
        globalChanges.set(key, new Map());
      }
      if(newStatusNode === 'node') {
          globalChanges.set(key, new Map());
        }
        else if(newStatusNode === 'leaf') {
          /**
           * Todo:
           * - Type checking
           * - Value setting
           */
          let message = 'changed';
          globalChanges.set(key, message);
        }
      infixedDeepWalk(newCurrentObj, oldCurrentObj, globalChanges.get(key));
    }
  }
}
