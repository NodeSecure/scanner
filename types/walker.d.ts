import { Manifest } from "@npm/types";
import Scanner from "./scanner";

export {
  depWalker
}

declare function depWalker(manifest: Manifest, options?: Scanner.Options);
