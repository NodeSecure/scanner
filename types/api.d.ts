import Scanner from "./scanner";

export {
  cwd,
  from,
  verify
}

declare function cwd(path: string, options?: Scanner.Options): Promise<Scanner.Payload>;
declare function from(packageName: string, options?: Scanner.Options): Promise<Scanner.Payload>;
declare function verify(packageName: string): Promise<Scanner.VerifyPayload>;
