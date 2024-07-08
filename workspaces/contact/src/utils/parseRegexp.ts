
export function parseRegExp(
  input: string
): null | RegExp {
  const match = input.match(/(\/+)(.+)\1([a-z]*)/i);
  if (!match) {
    return null;
  }

  const validFlags = Array.from(new Set(match[3]))
    .filter((flag) => "gimsuy".includes(flag))
    .join("");

  return new RegExp(match[2], validFlags);
}
