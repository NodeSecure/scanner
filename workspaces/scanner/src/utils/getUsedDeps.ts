export function getUsedDeps(
  deps: Set<`${string}@${string}`>
): string[][] {
  return [...deps].map((name) => {
    const isScoped = name.startsWith("@");
    if (isScoped) {
      const [nameChunk, version] = name.slice(1).split("@");

      return [`@${nameChunk}`, version];
    }

    return name.split("@");
  });
}
