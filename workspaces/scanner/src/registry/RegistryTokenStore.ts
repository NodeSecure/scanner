// Import Third-party Dependencies
import type Config from "@npmcli/config";

// Import Internal Dependencies
import { type TokenStore } from "../types.ts";

export class RegistryTokenStore implements TokenStore {
  #memo: Map<string, string | undefined> = new Map();
  #config: Config | undefined;
  #tokenFromEnv: string | undefined;
  constructor(config: Config | undefined, tokenFromEnv: string | undefined) {
    this.#config = config;
    this.#tokenFromEnv = tokenFromEnv;
  }

  get(registry: string): string | undefined {
    if (!this.#config) {
      return this.#tokenFromEnv;
    }
    if (this.#memo.has(registry)) {
      return this.#memo.get(registry);
    }
    const token = this.#config.get(this.getTokenKey(registry), "project") as string | undefined ?? this.#tokenFromEnv;
    this.#memo.set(registry, token);

    return token;
  }

  getConfig(registry: string) {
    return this.#config ? { [this.getKey(registry)]: this.get(registry) } : {};
  }

  private getTokenKey(registry: string) {
    return `${this.getKey(registry)}:_authToken`;
  }

  private getKey(registry: string) {
    return registry.replace(/https:|http:/, "");
  }
}
