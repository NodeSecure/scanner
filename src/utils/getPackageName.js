export function getPackageName(name) {
  const parts = name.split("/");

  return name.startsWith("@") ? `${parts[0]}/${parts[1]}` : parts[0];
}
