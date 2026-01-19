// Mimics lib/frontend/lib/currency/useCurrencySymbol.ts
// Only imports a TYPE from the shared types module

import type { LocalCurrency } from "../shared/types";

export function useCurrency(currency?: string | LocalCurrency): string {
  return currency || "USD";
}
