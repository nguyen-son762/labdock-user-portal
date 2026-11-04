import { authTokenStore } from "@/lib/auth-token-store";

import { checkoutSessionSchema, type CheckoutSession } from "../schemas/checkout.schema";

const STORAGE_PREFIX = "labdock:checkout-session:v1:";

export const checkoutSessionStorage = {
  get(orderId: string): CheckoutSession | null {
    try {
      const stored = window.sessionStorage.getItem(`${STORAGE_PREFIX}${orderId}`);
      if (!stored) return null;
      const parsed = checkoutSessionSchema.safeParse(JSON.parse(stored));
      return parsed.success && parsed.data.orderId === orderId ? parsed.data : null;
    } catch {
      // Storage may be unavailable; the in-memory query cache still supports navigation.
      return null;
    }
  },
  set(session: CheckoutSession): void {
    try {
      window.sessionStorage.setItem(`${STORAGE_PREFIX}${session.orderId}`, JSON.stringify(session));
    } catch {
      // Keep checkout successful when the browser disallows persistence.
    }
  },
  clear(): void {
    try {
      Object.keys(window.sessionStorage)
        .filter((key) => key.startsWith(STORAGE_PREFIX))
        .forEach((key) => window.sessionStorage.removeItem(key));
    } catch {
      // There is no persisted checkout data to clear when storage is unavailable.
    }
  },
};

authTokenStore.onSessionChange(() => checkoutSessionStorage.clear());
