// Import Node.js Dependencies
import os from "node:os";
import path from "node:path";

// Import Third-party Dependencies
import * as vulnera from "@nodesecure/vulnera";

// Import Internal Dependencies
import { GLOBAL_CONFIGURATION_DIRECTORY } from "./constants.ts";
import { loadJSONSchemaSync } from "./schema/loader.ts";

import {
  generateCIConfiguration,
  type CiConfiguration,
  type CiWarnings
} from "./projects/ci.ts";
import {
  generateReportConfiguration,
  type ReportConfiguration,
  type ReportChart
} from "./projects/report.ts";
import {
  generateScannerConfiguration,
  type ScannerConfiguration
} from "./projects/scanner.ts";

// CONSTANTS
// eslint-disable-next-line @openally/constants
export const JSONSchema = loadJSONSchemaSync();

export interface RC {
  /** version of the rc package used to generate the nodesecurerc file */
  version: string;
  /**
   * Language to use for i18n (translation in NodeSecure tools).
   * @see https://developer.mozilla.org/en-US/docs/Glossary/I18N
   * @see https://github.com/NodeSecure/i18n
   *
   * @default `english`
   */
  i18n?: "english" | "french";
  /**
   * Vulnerability strategy to use. Can be disabled by using `none` as value.
   * @see https://github.com/NodeSecure/vuln#available-strategy
   *
   * @default `github-advisory`
   */
  strategy?: vulnera.Kind;
  /**
   * Package Registry (default to NPM public registry)
   * @default `https://registry.npmjs.org`
   */
  registry?: string;
  /** NodeSecure scanner Object configuration */
  scanner?: ScannerConfiguration;
  /** NodeSecure ci Object configuration */
  ci?: CiConfiguration;
  /** NodeSecure report Object configuration */
  report?: ReportConfiguration;
}

export type RCGenerationMode = "minimal" | "ci" | "report" | "scanner" | "complete";

/**
 * @example
 * generateDefaultRC("complete");
 * generateDefaultRC(["ci", "report"]); // minimal + ci + report
 */
export function generateDefaultRC(
  mode: RCGenerationMode | RCGenerationMode[] = "minimal"
): RC {
  const modes = new Set(typeof mode === "string" ? [mode] : mode);

  const minimalRC = {
    version: "1.0.0",
    i18n: "english" as const,
    strategy: "github-advisory" as const,
    registry: "https://registry.npmjs.org"
  };
  const complete = modes.has("complete");

  return Object.assign(
    minimalRC,
    complete || modes.has("ci") ? generateCIConfiguration() : {},
    complete || modes.has("report") ? generateReportConfiguration() : {},
    complete || modes.has("scanner") ? generateScannerConfiguration() : {}
  );
}

/**
 * Dedicated directory for NodeSecure to store the configuration in the os HOME directory.
 */
export function homedir(): string {
  return path.join(os.homedir(), GLOBAL_CONFIGURATION_DIRECTORY);
}

export {
  generateCIConfiguration,
  type CiConfiguration,
  type CiWarnings,

  generateReportConfiguration,
  type ReportConfiguration,
  type ReportChart,

  generateScannerConfiguration,
  type ScannerConfiguration
};
