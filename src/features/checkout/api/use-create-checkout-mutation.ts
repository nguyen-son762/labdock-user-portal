import { useMutation, useQueryClient } from "@tanstack/react-query";

import { checkoutSessionStorage } from "../utils/checkout-session-storage";
import { checkoutService } from "./checkout.service";
import { checkoutSessionKeys } from "./use-checkout-session-query";

export function useCreateCheckoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: checkoutService.create,
    retry: false,
    onSuccess: (session) => {
      checkoutSessionStorage.set(session);
      queryClient.setQueryData(checkoutSessionKeys.detail(session.orderId), session);
    },
  });
}
