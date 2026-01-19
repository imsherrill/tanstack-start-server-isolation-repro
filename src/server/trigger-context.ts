// Mimics lib/api/cm/utils/trigger-events/withTriggerEventId.ts
// Uses AsyncLocalStorage which is Node.js-only
import { AsyncLocalStorage } from "async_hooks";

type TriggerEventStore = {
  triggerEventId: string | null | undefined;
};

const triggerEventContextStorage = new AsyncLocalStorage<TriggerEventStore>();

export async function withTriggerEventId<T>(
  triggerEventId: string | null | undefined,
  cb: () => Promise<T>,
): Promise<T> {
  return triggerEventContextStorage.run({ triggerEventId: triggerEventId ?? null }, cb);
}

export function getTriggerEventId(): string | undefined {
  const store = triggerEventContextStorage.getStore();
  return store?.triggerEventId ?? undefined;
}
