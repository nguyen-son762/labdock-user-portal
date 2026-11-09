import { useMutation } from "@tanstack/react-query";

import { checkoutService } from "./checkout.service";

export function useCreateCheckoutMutation() {
  return useMutation({
    mutationFn: checkoutService.create,
    retry: false,
  });
}
