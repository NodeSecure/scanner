// Import Third-party Dependencies
import type { Contact } from "@nodesecure/npm-types";

// Import Internal Dependencies
import { toContactWithMetadata } from "./toContactWithMetadata.ts";
import type { ContactWithMetadata } from "../types.ts";

export interface ContactExtractorPackageMetadata {
  author?: Contact | null;
  maintainers: Contact[];
}

export type ContactPackageMetaData = Partial<ContactExtractorPackageMetadata>;

export function extractMetadataContacts(
  metadata: ContactPackageMetaData
): ContactWithMetadata[] {
  return [
    ...(metadata.author ? [toContactWithMetadata<Contact>(metadata.author)] : []),
    ...(metadata.maintainers ? metadata.maintainers.map(toContactWithMetadata) : [])
  ];
}
