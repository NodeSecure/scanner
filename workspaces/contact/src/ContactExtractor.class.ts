// Import Third-party Dependencies
import type { Contact } from "@nodesecure/npm-types";

// Import Internal Dependencies
import {
  UnlitContact,
  type IlluminatedContact
} from "./UnlitContact.class.js";

export type { IlluminatedContact };

export interface ContactExtractorPackageMetadata {
  author?: Contact;
  maintainers: Contact[];
}

export interface ContactExtractorOptions {
  highlight: Contact[];
}

export class ContactExtractor {
  private highlighted: Contact[] = [];

  constructor(
    options: ContactExtractorOptions
  ) {
    const { highlight } = options;

    this.highlighted = structuredClone(highlight);
  }

  fromDependencies(
    dependencies: Record<string, ContactExtractorPackageMetadata>
  ): IlluminatedContact[] {
    const unlitContacts = this.highlighted
      .map((contact) => new UnlitContact(contact));

    for (const [packageName, metadata] of Object.entries(dependencies)) {
      for (const unlit of unlitContacts) {
        const isMaintainer = extractMetadataContacts(metadata)
          .some((contact) => unlit.compareTo(contact));
        if (isMaintainer) {
          unlit.dependencies.add(packageName);
        }
      }
    }

    return unlitContacts.flatMap(
      (unlit) => (unlit.dependencies.size > 0 ? [unlit.illuminate()] : [])
    );
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
