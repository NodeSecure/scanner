// Import Third-party Dependencies
import type { Contact } from "@nodesecure/npm-types";

export type ContactFlag = "free-email-service";

export interface ContactWithMetadata extends Contact {
  flags: ContactFlag[];
}
