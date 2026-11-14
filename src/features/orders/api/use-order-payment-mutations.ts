import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { CancelPaymentRequest } from "../schemas/order.schema";
import { orderKeys } from "./order-query-keys";
import { ordersService } from "./orders.service";

/** Both actions change the order status and the list summary, so every cached order view is refreshed. */
function useInvalidateOrders() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: orderKeys.all });
}

export function useConfirmTransferMutation() {
  const invalidateOrders = useInvalidateOrders();
  return useMutation({
    mutationFn: ordersService.confirmTransfer,
    retry: false,
    onSettled: () => {
      void invalidateOrders();
    },
  });
}

export function useCancelPaymentMutation() {
  const invalidateOrders = useInvalidateOrders();
  return useMutation({
    mutationFn: ({ orderId, ...request }: CancelPaymentRequest & { orderId: string }) =>
      ordersService.cancelPayment(orderId, request),
    retry: false,
    onSettled: () => {
      void invalidateOrders();
    },
  });
}
