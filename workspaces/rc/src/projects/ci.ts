// Import Types Dependencies
import * as jsxray from "@nodesecure/js-x-ray";

/**
 * Configuration dedicated for NodeSecure CI (or nsci)
 * @see https://github.com/NodeSecure/ci
 * @see https://github.com/NodeSecure/ci-action
 */
export interface CiConfiguration {
  /**
   * List of enabled reporters
   * @see https://github.com/NodeSecure/ci#reporters
   */
  reporters?: ("console" | "html")[];
  vulnerabilities?: {
    severity?: "medium" | "high" | "critical" | "all"
  };
  /**
   * JS-X-Ray warnings configuration
   * @see https://github.com/NodeSecure/js-x-ray#warnings-legends-v20
   */
  warnings?: CiWarnings | Record<jsxray.WarningName, CiWarnings>;
}
export type CiWarnings = "off" | "error" | "warning";

export function generateCIConfiguration(): { ci: CiConfiguration } {
  const ci: CiConfiguration = {
    reporters: ["console"],
    vulnerabilities: {
      severity: "medium"
    },
    warnings: "error"
  };

  return { ci };
}
