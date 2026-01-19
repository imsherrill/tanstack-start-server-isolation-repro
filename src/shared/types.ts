// Mimics lib/api/cm/utils/types/index.ts
// Has a VALUE import (not just type) that pulls in server code

import type { AppRouter } from "../server/trpc"; // Type-only - should be fine
import { getTriggerEventId } from "../server/trigger-context"; // VALUE import - pulls in async_hooks!

export type LocalCurrency = "USD" | "EUR" | "GBP";

// Re-export the function (makes it a value, not just type)
export { getTriggerEventId };

// Export the type
export type { AppRouter };
