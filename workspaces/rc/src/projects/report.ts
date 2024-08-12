
/**
 * Configuration dedicated for NodeSecure Report
 * @see https://github.com/NodeSecure/report
 */
export interface ReportConfiguration {
  /**
   * @default `light`
   */
  theme?: "light" | "dark";
  title: string;
  /**
   * URL to a logo to show on the final HTML/PDF Report
   */
  logoUrl?: string;
  /**
   * Show/categorize internal dependencies as transitive
   * @default false
   */
  includeTransitiveInternal?: boolean;
  npm?: {
    /**
     * NPM organization prefix starting with @
     * @example `@nodesecure`
     */
    organizationPrefix: string;
    packages: string[];
  },
  git?: {
    /**
     * GitHub organization URL
     * @example `https://github.com/NodeSecure`
     */
    organizationUrl: string;
    /**
     * List of repositories (name are enough, no need to provide .git url or any equivalent)
     */
    repositories: string[];
  },
  /**
   * @default html,pdf
   */
  reporters?: ("html" | "pdf")[];
  /**
   * Show/Hide flags emojis next to packages.
   * @default true
   */
  showFlags?: boolean;
  charts?: ReportChart[];
}

export interface ReportChart {
  /**
   * List of available charts.
   */
  name: "Extensions" | "Licenses" | "Warnings" | "Flags";
  /**
   * @default true
   */
  display?: boolean;
  /**
   * Chart.js chart type.
   *
   * @see https://www.chartjs.org/docs/latest/charts
   * @default `bar`
   */
  type?: "bar" | "horizontalBar" | "polarArea" | "doughnut";
  /**
   * D3 Interpolation color. Will be picked randomly by default if not provided.
   * @see https://github.com/d3/d3-scale-chromatic/blob/main/README.md
   */
  interpolation?: string;
}

export function generateReportConfiguration(): { report: Partial<ReportConfiguration> } {
  const report: Partial<ReportConfiguration> = {
    theme: "light" as const,
    includeTransitiveInternal: false,
    reporters: ["html", "pdf"],
    charts: [
      {
        name: "Extensions" as const,
        display: true,
        interpolation: "d3.interpolateRainbow"
      },
      {
        name: "Licenses" as const,
        display: true,
        interpolation: "d3.interpolateCool"
      },
      {
        name: "Warnings" as const,
        display: true,
        type: "horizontalBar" as const,
        interpolation: "d3.interpolateInferno"
      },
      {
        name: "Flags" as const,
        display: true,
        type: "horizontalBar" as const,
        interpolation: "d3.interpolateSinebow"
      }
    ]
  };

  return { report };
}
