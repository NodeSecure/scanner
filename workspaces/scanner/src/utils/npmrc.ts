// Import Node.js Dependencies
import { readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

function resolveEnvVars(value: string): string {
  return value.replace(
    /\$\{([^}]+)\}/g,
    (_, envVar) => process.env[envVar] ?? ""
  );
}

export function parseNpmRc(content: string): Record<string, string> {
  const entries: Record<string, string> = {};

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith(";")) {
      continue;
    }

    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, eqIndex).trim();
    const value = resolveEnvVars(trimmed.slice(eqIndex + 1).trim());

    entries[key] = value;
  }

  return entries;
}

async function readNpmRcFile(filePath: string): Promise<Record<string, string>> {
  try {
    const content = await readFile(filePath, "utf-8");

    return parseNpmRc(content);
  }
  catch {
    return {};
  }
}

export async function readNpmRc(location: string): Promise<Record<string, string>> {
  const [userEntries, projectEntries] = await Promise.all([
    readNpmRcFile(path.join(os.homedir(), ".npmrc")),
    readNpmRcFile(path.join(location, ".npmrc"))
  ]);

  return { ...userEntries, ...projectEntries };
}

export function getRegistryForPackage(
  packageName: string,
  npmRcEntries: Record<string, string>,
  defaultRegistry: string
): string {
  const scopeMatch = packageName.match(/^(@[^/]+)\//);
  if (scopeMatch) {
    const scopeKey = `${scopeMatch[1]}:registry`;
    if (scopeKey in npmRcEntries) {
      return npmRcEntries[scopeKey];
    }
  }

  return defaultRegistry;
}
