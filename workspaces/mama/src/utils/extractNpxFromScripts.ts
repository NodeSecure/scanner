// Import Internal Dependencies
import { parseNpmSpec } from "./parseNpmSpec.ts";

export type NpxCommand = {
  binaryName: string;
  flags: string[];
  scriptName: string;
};

export function* extractNpxFromScripts(
  scripts: Record<string, string> | undefined
): IterableIterator<NpxCommand> {
  if (!scripts) {
    return;
  }

  for (const [scriptName, scriptValue] of Object.entries(scripts)) {
    for (const npx of extractNpx(scriptValue, scriptName)) {
      yield npx;
    }
  }
}

function* extractNpx(command: string, scriptName: string): IterableIterator<NpxCommand> {
  const npxPattern = /\bnpx\s+((?:--?\w[\w-]*(?:[=\s]\S+)?\s+)*)(\S+)/g;
  let match: RegExpExecArray | null;
  while ((match = npxPattern.exec(command)) !== null) {
    const flags = match[1].split(" ").filter(Boolean);

    const npmSpec = parseNpmSpec(match[2]);

    yield {
      binaryName: npmSpec?.name!,
      flags,
      scriptName
    };
  }
}
