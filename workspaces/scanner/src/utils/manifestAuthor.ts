// Import Third-party Dependencies
import type { Contact } from "@nodesecure/npm-types";

export function manifestAuthor(author: string | Contact | undefined): Contact | null {
  if (author === void 0) {
    return null;
  }

  if (typeof author === "string") {
    if (author.trim() === "") {
      return null;
    }

    const authorRegexp = /^([^<(]+?)?[ \t]*(?:<([^>(]+?)>)?[ \t]*(?:\(([^)]+?)\)|$)/g;
    const [_, name, email, url] = authorRegexp.exec(author) ?? [];

    return { name, email, url };
  }

  return author;
}
