export type FlagDescriptor = {
  /** An emoji to visually identify the anomaly **/
  emoji: string;
  /** Title (or name) of the flag **/
  title: string;
  /** Short description/warning of the anomaly **/
  tooltipDescription: string;
};
export type Flag = keyof typeof FLAGS | (string & {});

export const FLAGS = {
  externalCapacity: {
    emoji: "🌍",
    title: "hasExternalCapacity",
    tooltipDescription: "The package uses at least one Node.js core dependency " +
      "capable to establish communication outside of localhost"
  },
  warnings: {
    emoji: "🚧",
    title: "hasWarnings",
    tooltipDescription: "The AST analysis has detected warnings (suspect import, unsafe regex ..)"
  },
  nativeCode: {
    emoji: "🐲",
    title: "hasNativeCode",
    tooltipDescription: "The package uses and runs C++ or Rust N-API code"
  },
  customResolver: {
    emoji: "💎",
    title: "hasCustomResolver",
    tooltipDescription: "The package has dependencies who do not resolve on a registry (git, file, ssh etc..)"
  },
  noLicense: {
    emoji: "📜",
    title: "hasNoLicense",
    tooltipDescription: "The package does not have a license"
  },
  multipleLicense: {
    emoji: "📚",
    title: "hasMultipleLicenses",
    tooltipDescription: "The package has licenses in multiple locations (files or manifest)"
  },
  minifiedCode: {
    emoji: "🔬",
    title: "hasMinifiedCode",
    tooltipDescription: "The package has minified and/or uglified files"
  },
  isDeprecated: {
    emoji: "⛔️",
    title: "isDeprecated",
    tooltipDescription: "The package has been deprecated on NPM"
  },
  manyPublishers: {
    emoji: "👥",
    title: "hasManyPublishers",
    tooltipDescription: "The package has several publishers"
  },
  hasScript: {
    emoji: "📦",
    title: "hasScript",
    tooltipDescription: "The package has `post` and/or `pre` (un)install npm script"
  },
  indirectDependencies: {
    emoji: "🌲",
    title: "hasIndirectDependencies",
    tooltipDescription: "The package has indirect dependencies"
  },
  isGit: {
    emoji: "☁️",
    title: "isGit",
    tooltipDescription: "The package (project) is a git repository"
  },
  vulnerabilities: {
    emoji: "🚨",
    title: "hasVulnerabilities",
    tooltipDescription: "The package has one or many vulnerabilities"
  },
  missingOrUnusedDependency: {
    emoji: "👀",
    title: "hasMissingOrUnusedDependency",
    tooltipDescription: "A dependency is missing in package.json or a dependency is installed but never used"
  },
  isDead: {
    emoji: "💀",
    title: "isDead",
    tooltipDescription: "The dependency has not received update from at least one year"
  },
  bannedFile: {
    emoji: "⚔️",
    title: "hasBannedFile",
    tooltipDescription: "The project has at least one sensitive file"
  },
  outdated: {
    emoji: "⌚️",
    title: "isOutdated",
    tooltipDescription: "The current package version is not equal to the package latest version"
  },
  duplicated: {
    emoji: "🎭",
    title: "hasDuplicate",
    tooltipDescription: "The package is also used somewhere else in the dependency tree but with a different version"
  }
} satisfies Record<string, FlagDescriptor>;
