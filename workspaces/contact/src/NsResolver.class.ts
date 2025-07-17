// Import Node.js Dependencies
import { Resolver } from "node:dns/promises";

export class NsResolver {
  #dns = new Resolver();
  #emails = new Set<string>();

  constructor() {
    this.#dns.setServers([
      "1.1.1.1",
      "8.8.8.8"
    ]);
  }

  registerEmail(
    email: string | undefined | null
  ) {
    // eslint-disable-next-line no-eq-null
    if (email == null || email.trim() === "") {
      return;
    }

    this.#emails.add(email);
  }

  async #resolveNs(
    email: string
  ): Promise<null | string> {
    const hostname = email.split("@")[1];

    try {
      await this.#dns.resolveNs(hostname);

      return null;
    }
    catch {
      return email;
    }
  }

  async getExpired() {
    const emails = Array.from(this.#emails);

    const promises = emails.map(
      (email) => this.#resolveNs(email)
    );

    const expiredEmails = (await Promise.all(promises))
      .flatMap((email) => (email === null ? [] : [email]));

    return expiredEmails;
  }
}
