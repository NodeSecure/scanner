// Import Third-party Dependencies
import type { Contact } from "@nodesecure/npm-types";
import type { RequireAtLeastOne } from "type-fest";

// Import Internal Dependencies
import * as utils from "./utils/index.ts";
import type { ContactWithMetadata } from "./types.ts";

export type EnforcedContact = RequireAtLeastOne<
  Contact,
  "name" | "email"
>;

export type EnforcedContactWithMetadata = RequireAtLeastOne<ContactWithMetadata, "name" | "email">;

export type IlluminatedContact = EnforcedContactWithMetadata & {
  dependencies: string[];
};

export class UnlitContact {
  private illuminated: EnforcedContactWithMetadata;
  private extendedName: RegExp | null = null;

  public dependencies = new Set<string>();

  constructor(
    contact: EnforcedContact
  ) {
    this.illuminated = structuredClone(utils.toContactWithMetadata(contact));
    this.extendedName = typeof contact.name === "string" ?
      utils.parseRegExp(contact.name) :
      null;
  }

  compareTo(
    contact: ContactWithMetadata
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
