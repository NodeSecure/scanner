// Import Third-party Dependencies
import type { Contact } from "@nodesecure/npm-types";

// Import Internal Dependencies
import * as utils from "./utils/index.js";

export type IlluminatedContact = Contact & {
  dependencies: string[];
};

export class UnlitContact {
  private illuminated: Contact;
  private extendedName: RegExp | null = null;

  public dependencies = new Set<string>();

  constructor(
    contact: Contact
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

    if (contact.name && this.extendedName.test(contact.name)) {
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
