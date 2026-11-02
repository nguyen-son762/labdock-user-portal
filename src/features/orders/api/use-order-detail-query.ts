import { useQuery } from "@tanstack/react-query";

import { orderKeys } from "./order-query-keys";
import { ordersService } from "./orders.service";

export function useOrderDetailQuery(orderId: string, options?: { refetchOnMount?: boolean | "always" }) {
  return useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: ({ signal }) => ordersService.getById(orderId, signal),
    staleTime: 30_000,
    refetchOnMount: options?.refetchOnMount,
  });
}
