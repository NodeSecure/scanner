export function checkEveryTruthy(
  ...arrayOfBooleans: boolean[]
): boolean {
  return arrayOfBooleans.every((check) => check);
}

export function checkSomeTruthy(
  ...arrayOfBooleans: boolean[]
): boolean {
  return arrayOfBooleans.some((check) => check);
}

export function createSpdxLink(
  license: string
): string {
  return `https://spdx.org/licenses/${license}.html#licenseText`;
}
