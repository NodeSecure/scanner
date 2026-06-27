// Import Third-party Dependencies
import type { Contact } from "@nodesecure/npm-types";

// Import Internal Dependencies
import type { ContactFlag } from "../types.ts";

// CONSTANS
const kFreeEmailServiceRegex = new RegExp(
  "(gmail\\.com|yahoo\\.com|hotmail\\.com|outlook\\.com|live\\.com|" +
  "protonmail\\.com|proton\\.me|mail\\.ru|yandex\\.ru|qq\\.com|" +
  "163\\.com|aol\\.com|icloud\\.com|zoho\\.com)$"
);

export function toContactWithMetadata<T extends Partial<Contact>>(
  contact: T): T & { flags: ContactFlag[]; } {
  if ("flags" in contact) {
    return contact as T & { flags: ContactFlag[]; };
  }
  const flags: ContactFlag[] = [];
  if (!(typeof contact.email === "string")) {
    return { ...contact, flags: [] as ContactFlag[] };
  }

  if (kFreeEmailServiceRegex.test(contact.email)) {
    flags.push("free-email-service");
  }

  return {
    ...contact,
    flags
  };
}
