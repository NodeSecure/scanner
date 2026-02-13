# Logger API

A lightweight event-based timing and monitoring utility for tracking code execution phases and errors.

## Usage example

Here's how to track the execution time of a custom operation:

```ts
import { Logger } from "@nodesecure/scanner";

const logger = new Logger();

logger.on("start", (eventName) => {
  console.log(`Starting: ${eventName}`);
});

logger.on("tick", (eventName) => {
  console.log(`Tick: ${eventName}`);
});

logger.on("end", (eventName, data) => {
  console.log(`Finished: ${eventName}`);
  console.log(`Duration: ${data.executionTime}ms`);
  console.log(`Iterations: ${data.count}`);
});

logger.start("my-operation");

for (let i = 0; i < 5; i++) {
  logger.tick("my-operation");
}

logger.end("my-operation");
```

## Events

The Logger class extends Node.js `EventEmitter`, allowing you to listen for lifecycle events during tracking.

### start

Emitted when a new event tracking is initiated:

```ts
logger.on("start", (eventName: string) => {
  // Handle start event
});
```

### tick

Emitted each time `tick()` is called for a tracked event:

```ts
logger.on("tick", (eventName: string) => {
  // Handle tick event
});
```

### end

Emitted when `end()` is called, with full execution metadata:

```ts
logger.on("end", (eventName: string, data: LoggerEventData & { executionTime: number }) => {
  console.log(`Execution time: ${data.executionTime}ms`);
  console.log(`Total ticks: ${data.count}`);
});
```

### error

Emitted when an error occurs during the logging process:

```ts
logger.on("error", (error: Error, phase?: string) => {
  console.error(`Error in ${phase ?? "unknown"}:`, error);
});
```

### stat

Emitted when a successful API call is made:

```ts
logger.on("stat", (stat: ApiStats) => {
  console.log(`API call: ${stat.name}`);
  console.log(`Duration: ${stat.executionTime}ms`);
  console.log(`Start at: ${stat.startedAt}`);
});

### depWalkerFinished

Emitted when the dependency walker completes its analysis:

```ts
logger.on("depWalkerFinished", () => {
  console.log("Dependency analysis complete");
});
```

## API

### constructor()

Creates a new Logger instance.

```ts
const logger = new Logger();
```

### start(eventName: string): this

Begins tracking a new event. If the event is already being tracked, this is a no-op.

```ts
logger.start("custom-event");
```

### tick(eventName: string): this

Increments the tick count for a tracked event. Does nothing if the event is not being tracked.

```ts
logger.tick("custom-event");
```

### count(eventName: string): number

Returns the current tick count for a tracked event, or `0` if the event is not being tracked.

```ts
const count = logger.count("custom-event");
console.log(`Ticks: ${count}`);
```

### end(eventName: string): this

Ends tracking for an event and emits the `end` event with execution metadata.

```ts
logger.end("custom-event");
```

## Interfaces

### LoggerEventData

```ts
export interface LoggerEventData {
  /** UNIX Timestamp */
  startedAt: number;
  /** Count of triggered event */
  count: number;
}

export type LoggerEventError = {
  executionTime: number;
} & Error;
```

### LoggerEventsMap

```ts
export type LoggerEventsMap = {
  start: [eventName: string];
  tick: [eventName: string];
  end: [eventName: string, data: LoggerEventData & { executionTime: number; }];
  depWalkerFinished: [];
  error: [error: LoggerEventError, phase?: string];
  stat: [stat: ApiStats];
};
```
