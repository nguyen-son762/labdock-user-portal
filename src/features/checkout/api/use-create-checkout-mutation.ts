import { useMutation, useQueryClient } from "@tanstack/react-query";

import { cartQueryKeys } from "./cart-query-keys";
import { checkoutService } from "./checkout.service";

export function useCreateCheckoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: checkoutService.create,
    retry: false,
    // The API removes the checked-out items from the cart as soon as the order is created.
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: cartQueryKeys.detail() });
    },
  });
}
