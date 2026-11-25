import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { cartQueryKeys } from "./cart-query-keys";
import { cartService } from "./cart.service";
import type { CartItem } from "../schemas/cart.schema";

// The key includes variant and quantity so the quote refreshes whenever a selected line changes.
export function useCartQuoteQuery(items: CartItem[]) {
  const lineSignature = items.map(({ id, variantId, quantity }) => `${id}:${variantId ?? ""}:${quantity}`);
  return useQuery({
    queryKey: cartQueryKeys.quote(lineSignature),
    queryFn: ({ signal }) => cartService.quote({ cartItemIds: items.map(({ id }) => id) }, signal),
    enabled: items.length > 0,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}
