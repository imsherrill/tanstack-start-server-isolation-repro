// Mimics lib/api/cm/logger.ts - imports the trigger context module
import { getTriggerEventId } from "./trigger-context";

type LogData = Record<string, unknown>;

export function info(data: LogData, message: string) {
  const triggerEventId = getTriggerEventId();
  console.log(JSON.stringify({ level: "info", triggerEventId, ...data, message }));
}

export function warn(data: LogData, message: string) {
  const triggerEventId = getTriggerEventId();
  console.warn(JSON.stringify({ level: "warn", triggerEventId, ...data, message }));
}

export function error(data: LogData, message: string) {
  const triggerEventId = getTriggerEventId();
  console.error(JSON.stringify({ level: "error", triggerEventId, ...data, message }));
}

const logger = { info, warn, error };
export default logger;
