// Import Third-party Dependencies
import type { Contact, PackumentVersion } from "@nodesecure/npm-types";

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

type ContactPackageMetaData = Partial<ContactExtractorPackageMetadata>;

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
      this.addDependencyToUnlitContacts(unlitContacts, extractedContacts, packageName);
    }

    return this.processIlluminatedAndExpired(unlitContacts, resolver);
  }

  async fromManifest(manifest: PackumentVersion) {
    const resolver = new NsResolver();
    const unlitContacts = this.highlighted
      .map((contact) => new UnlitContact(contact));

    const extractedContacts = extractMetadataContacts(manifest);

    extractedContacts.forEach((contact) => resolver.registerEmail(contact.email));
    this.addDependencyToUnlitContacts(unlitContacts, extractedContacts, manifest.name);

    return this.processIlluminatedAndExpired(unlitContacts, resolver);
  }

  private addDependencyToUnlitContacts(
    unlitContacts: UnlitContact[],
    contacts: Contact[],
    packageName: string
  ) {
    for (const unlit of unlitContacts) {
      const isMaintainer = contacts.some((contact) => unlit.compareTo(contact));
      if (isMaintainer) {
        unlit.dependencies.add(packageName);
      }
    }
  }

  private async processIlluminatedAndExpired(unlitContacts: UnlitContact[], resolver: NsResolver) {
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
  metadata: ContactPackageMetaData
): Contact[] {
  return [
    ...(metadata.author ? [metadata.author] : []),
    ...(metadata.maintainers ? metadata.maintainers : [])
  ];
}
