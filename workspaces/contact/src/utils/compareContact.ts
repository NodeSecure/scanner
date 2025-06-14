// Import Third-party Dependencies
import type { Contact } from "@nodesecure/npm-types";

export interface CompareOptions {
  /**
   * @default true
   */
  compareName?: boolean;
}

/**
 * Compare two contacts and return true if they are the same person
 *
 * TODO:
 * - name separated by comma instead of space
 * - lot of emails is a combinaison of last name + first name
 * - look for name in email and url
 * - add options for custom/advanced comparaison
 */
export function compareContact(
  contactA: Partial<Contact>,
  contactB: Partial<Contact>,
  options: CompareOptions = Object.create(null)
): boolean {
  const { compareName = true } = options;

  if (
    compareName &&
    typeof contactA.name === "string" &&
    typeof contactB.name === "string"
  ) {
    const aName = cleanup(contactA.name);
    const bName = cleanup(contactB.name);

    const aNameReversed = reverse(aName);
    const bNameReversed = reverse(bName);

    if (
      aName === bName ||
      aNameReversed === bName ||
      aName === bNameReversed ||
      aNameReversed === bNameReversed
    ) {
      return true;
    }
  }

  if (
    typeof contactA.email === "string" &&
    typeof contactB.email === "string" &&
    compareEmail(contactA.email, contactB.email)
  ) {
    return true;
  }

  if (
    typeof contactA.url === "string" &&
    typeof contactB.url === "string" &&
    compareURL(contactA.url, contactB.url)
  ) {
    return true;
  }

  return false;
}

function compareEmail(
  emailA: string,
  emailB: string
) {
  const cleanEmailA = cleanup(emailA);
  const cleanEmailB = cleanup(emailB);

  return cleanEmailA === cleanEmailB;
}

function compareURL(
  urlA: string,
  urlB: string
) {
  const cleanURLA = cleanup(urlA);
  const cleanURLB = cleanup(urlB);

  return cleanURLA === cleanURLB;
}

/**
 * A minimal cleanup to avoid any mistakes
 * @example
 * cleanup(" John  Doe"); // "john doe"
 */
function cleanup(
  value: string
): string {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

/**
 * The goal of this function is to reverse first name and last name
 * @example
 * reverse("john doe"); // "doe john"
 */
function reverse(
  name: string
): string {
  return name
    .split(" ")
    .reverse()
    .join(" ");
}
