import { EventEmitter } from "events";

export {
  Logger,
  LoggerEventData
}

interface LoggerEventData {
  startedAt: number;
  count: number;
}

declare class Logger extends EventEmitter {
  public runningEvents: Map<string, LoggerEventData>;

  constructor();

  start(eventName: string): Logger;
  end(eventName: string): Logger;
  tick(eventName: string): Logger;
  count(eventName: string): number;
}
