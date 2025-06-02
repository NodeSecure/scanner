// Import Third-party Dependencies
import type { Contact } from "@nodesecure/npm-types";

// Import Internal Dependencies
import type {
  ManifestProbeExtractor,
  ProbeExtractorManifestParent
} from "../payload.js";
import type { DependencyVersion } from "../../types.js";

export type ContactsResult = {
  contacts: Record<string, number>;
};

export class Contacts implements ManifestProbeExtractor<ContactsResult> {
  level = "manifest" as const;

  #contacts: ContactsResult["contacts"] = Object.create(null);
  #packages: Set<string> = new Set();

  #addContact(
    user: Contact | null
  ) {
    if (!user || !user.email) {
      return;
    }

    this.#contacts[user.email] = user.email in this.#contacts ?
      ++this.#contacts[user.email] : 1;
  }

  next(
    _: string,
    version: DependencyVersion,
    parent: ProbeExtractorManifestParent
  ) {
    const { author } = version;
    const { name, dependency } = parent;

    this.#addContact(author);
    if (!this.#packages.has(name)) {
      dependency.metadata.maintainers.forEach(
        (maintainer) => this.#addContact(maintainer)
      );
      this.#packages.add(name);
    }
  }

  done() {
    return {
      contacts: this.#contacts
    };
  }
}
