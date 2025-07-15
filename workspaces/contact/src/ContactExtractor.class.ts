// Import Third-party Dependencies
import type { Contact } from "@nodesecure/npm-types";

// Import Internal Dependencies
import {
  UnlitContact,
  type EnforcedContact,
  type IlluminatedContact
} from "./UnlitContact.class.js";
import { NsResolver } from "./NsResolver.class.js";

export type {
  IlluminatedContact,
  EnforcedContact
};

export interface ContactExtractorPackageMetadata {
  author?: Contact;
  maintainers: Contact[];
}

export interface ContactExtractorFromDependenciesResult {
  illuminated: IlluminatedContact[];
  /**
   * List of email domains that are expired
   */
  expired: string[];
}

export interface ContactExtractorOptions {
  highlight: EnforcedContact[];
}

export class ContactExtractor {
  private highlighted: EnforcedContact[] = [];

  constructor(
    options: ContactExtractorOptions
  ) {
    const {
      highlight
    } = options;

    this.highlighted = structuredClone(highlight);
  }

  async fromDependencies(
    dependencies: Record<string, ContactExtractorPackageMetadata>
  ): Promise<ContactExtractorFromDependenciesResult> {
    const unlitContacts = this.highlighted
      .map((contact) => new UnlitContact(contact));
    const resolver = new NsResolver();

    for (const [packageName, metadata] of Object.entries(dependencies)) {
      const extractedContacts = extractMetadataContacts(metadata);
      extractedContacts.forEach((contact) => resolver.registerEmail(contact.email));

      for (const unlit of unlitContacts) {
        const isMaintainer = extractedContacts
          .some((contact) => unlit.compareTo(contact));
        if (isMaintainer) {
          unlit.dependencies.add(packageName);
        }
      }
    }

    const expired = await resolver.getExpired();

    const illuminated = unlitContacts.flatMap(
      (unlit) => (unlit.dependencies.size > 0 ? [unlit.illuminate()] : [])
    );

    return {
      expired,
      illuminated
    };
  }
}

function extractMetadataContacts(
  metadata: ContactExtractorPackageMetadata
): Contact[] {
  return [
    ...(metadata.author ? [metadata.author] : []),
    ...metadata.maintainers
  ];
}
