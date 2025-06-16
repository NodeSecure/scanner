export function taggedString(strings: TemplateStringsArray, ...keys: (number | string)[]) {
  return function cur(...values: (string | number | { [key: string]: any; })[]) {
    const lastVal = values[values.length - 1];
    const dict = typeof lastVal === "object" && lastVal !== null ? lastVal : {};
    const result = [strings[0]];
    keys.forEach((key, index) => {
      result.push(
        typeof key === "number" ? values[key] : dict[key],
        strings[index + 1]
      );
    });

    return result.join("");
  };
}
