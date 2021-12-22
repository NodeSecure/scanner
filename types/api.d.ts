import Scanner from "./scanner";
import { Logger, LoggerEvents } from "./logger";

export {
  cwd,
  from,
  verify,
  ScannerLoggerEvents
}

declare const ScannerLoggerEvents: LoggerEvents;

declare function cwd(path: string, options?: Scanner.Options, logger?: Logger): Promise<Scanner.Payload>;
declare function from(packageName: string, options?: Scanner.Options, logger?: Logger): Promise<Scanner.Payload>;
declare function verify(packageName: string): Promise<Scanner.VerifyPayload>;
