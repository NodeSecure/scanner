// Import Node.js Dependencies
import path from "path";
import fs from "fs/promises";

export function* deepReadPackageLock(dependencies) {
  for (const [depName, infos] of Object.entries(dependencies)) {
    if (!infos.dev) {
      yield [depName, infos];
      if ("dependencies" in infos) {
        yield* deepReadPackageLock(infos.dependencies);
      }
    }
  }
}

export async function* readPackageLock(filePath = path.join(process.cwd(), "package-lock.json")) {
  const buf = await fs.readFile(filePath);
  const { dependencies = {} } = JSON.parse(buf.toString());

  yield* deepReadPackageLock(dependencies);
}

