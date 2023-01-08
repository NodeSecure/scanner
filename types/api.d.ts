import Scanner from "./scanner.js";
import { Logger, LoggerEvents } from "./logger.js";

export {
  cwd,
  from,
  verify,
  ScannerLoggerEvents
}

declare const ScannerLoggerEvents: LoggerEvents;

declare function cwd(location: string, options?: Scanner.Options, logger?: Logger): Promise<Scanner.Payload>;
declare function from(packageName: string, options?: Omit<Scanner.Options, "includeDevDeps">, logger?: Logger): Promise<Scanner.Payload>;
declare function verify(packageName?: string | null): Promise<Scanner.VerifyPayload>;
