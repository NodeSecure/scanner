// Import Internal Dependencies
import type { Payload } from "../types.ts";

export function isNodesecurePayload(
  data: Payload | Payload["dependencies"]
): data is Payload {
  return "dependencies" in data && "id" in data && "scannerVersion" in data;
}
