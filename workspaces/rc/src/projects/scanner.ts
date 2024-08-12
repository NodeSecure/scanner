// Import Third-party Dependencies
import type { Contact } from "@nodesecure/npm-types";

/**
 * Configuration dedicated for NodeSecure scanner
 * @see https://github.com/NodeSecure/scanner
 */
export interface ScannerConfiguration {
  highlight?: {
    contacts: Contact[];
  }
}

export function generateScannerConfiguration(): { scanner: ScannerConfiguration } {
  const scanner: ScannerConfiguration = {
    highlight: {
      contacts: []
    }
  };

  return { scanner };
}
