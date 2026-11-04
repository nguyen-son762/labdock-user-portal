import { useQuery } from "@tanstack/react-query";

import { checkoutSessionStorage } from "../utils/checkout-session-storage";

export const checkoutSessionKeys = {
  detail: (orderId: string) => ["checkout-sessions", orderId] as const,
};

export function useCheckoutSessionQuery(orderId: string) {
  return useQuery({
    queryKey: checkoutSessionKeys.detail(orderId),
    // The API only returns payment instructions from POST; never recreate an order to reload them.
    queryFn: () => checkoutSessionStorage.get(orderId),
    staleTime: Infinity,
    retry: false,
  });
}
