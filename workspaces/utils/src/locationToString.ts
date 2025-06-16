/**
 * @description Transform a JS-X-Ray location to string, example: [[3, 4], [3, 37]]
 * The first array is the start with [line, column]
 * The second one is the end with [line, column]
 */
export function locationToString(location: number[][]): string {
  const start = `${location[0][0]}:${location[0][1]}`;
  const end = `${location[1][0]}:${location[1][1]}`;

  return `[${start}] - [${end}]`;
}
