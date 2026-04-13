// Import Third-party Dependencies
import { type EnforcedContact, type IlluminatedContact, UnlitContact, extractMetadataContacts } from "@nodesecure/contact";
import type { Contact } from "@nodesecure/npm-types";

// Import Internal Dependencies
import type {
  PackumentProbeExtractor
} from "../payload.ts";
import type { Dependency } from "../../types.ts";

export type HighlightedContactsResult = {
  illuminated: IlluminatedContact[];
};

export class HighlightedContacts implements PackumentProbeExtractor<HighlightedContactsResult> {
  level = "packument" as const;

  #unlitContacts: UnlitContact[];

  constructor(contacts: EnforcedContact[]) {
    this.#unlitContacts = contacts.map((contact) => new UnlitContact(contact));
  }

  next(packageName: string, dependency: Dependency) {
    const extractedContacts = extractMetadataContacts(dependency.metadata);
    this.addDependencyToUnlitContacts(extractedContacts, packageName);
  }

  private addDependencyToUnlitContacts(
    contacts: Contact[],
    packageName: string
  ) {
    for (const unlit of this.#unlitContacts) {
      const isMaintainer = contacts.some((contact) => unlit.compareTo(contact));
      if (isMaintainer) {
        unlit.dependencies.add(packageName);
      }
    }
  }

  done() {
    const illuminated = this.#unlitContacts.flatMap(
      (unlit) => (unlit.dependencies.size > 0 ? [unlit.illuminate()] : [])
    );

    return {
      illuminated
    };
  }
}
