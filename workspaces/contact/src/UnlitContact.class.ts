// Import Third-party Dependencies
import type { Contact } from "@nodesecure/npm-types";
import type { RequireAtLeastOne } from "type-fest";

// Import Internal Dependencies
import * as utils from "./utils/index.js";

export type EnforcedContact = RequireAtLeastOne<
  Contact,
  "name" | "email"
>;

export type IlluminatedContact = EnforcedContact & {
  dependencies: string[];
};

export class UnlitContact {
  private illuminated: EnforcedContact;
  private extendedName: RegExp | null = null;

  public dependencies = new Set<string>();

  constructor(
    contact: EnforcedContact
  ) {
    this.illuminated = structuredClone(contact);
    this.extendedName = typeof contact.name === "string" ?
      utils.parseRegExp(contact.name) :
      null;
  }

  compareTo(
    contact: Contact
  ): boolean {
    if (this.extendedName === null) {
      return utils.compareContact(this.illuminated, contact);
    }

    if (this.extendedName.test(contact.name)) {
      return true;
    }

    return utils.compareContact(this.illuminated, contact, {
      compareName: false
    });
  }

  illuminate(): IlluminatedContact {
    return {
      ...this.illuminated,
      dependencies: [...this.dependencies]
    };
  }
}
