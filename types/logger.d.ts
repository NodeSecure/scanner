import { EventEmitter } from "events";

export {
  Logger,
  LoggerEventData
}

interface LoggerEventData {
  /** UNIX Timestamp */
  startedAt: number;
  /** Count of triggered event */
  count: number;
}

declare class Logger extends EventEmitter {
  public events: Map<string, LoggerEventData>;

  constructor();

  start(eventName: string): Logger;
  end(eventName: string): Logger;
  tick(eventName: string): Logger;
  count(eventName: string): number;
}
