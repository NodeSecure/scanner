/**
 * @function taggedString
 * @memberof utils#
 * @description Create a tagged String
 * @param {TemplateStringsArray} chaines initial string
 * @param {string[] | number[]} cles keys
 * @returns {Function} Return clojure function to build the final string
 *
 * @example
 * const { taggedString } = require("@myunisoft/utils");
 *
 * const myStrClojure = taggedString`Hello ${0}!`;
 * console.log(myStrClojure("Thomas")); // stdout: Hello Thomas!
 */
export function taggedString(
  chaines: TemplateStringsArray,
  ...cles: string[] | number[]
) {
  return function cur(...valeurs: any[]): string {
    const dict = valeurs[valeurs.length - 1] || {};
    const resultat = [chaines[0]];
    cles.forEach((cle, index) => {
      resultat.push(
        typeof cle === "number" ? valeurs[cle] : dict[cle],
        chaines[index + 1]
      );
    });

    return resultat.join("");
  };
}
