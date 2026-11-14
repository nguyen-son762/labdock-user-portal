import { httpClient } from "@/lib/http-client";

import {
  cancelPaymentResponseSchema,
  confirmTransferResponseSchema,
  orderDetailSchema,
  orderFiltersSchema,
  orderListResponseSchema,
  type CancelPaymentRequest,
  type CancelPaymentResponse,
  type ConfirmTransferResponse,
  type OrderDetail,
  type OrderFilters,
  type OrderListResponse,
} from "../schemas/order.schema";

const orderIdSchema = orderDetailSchema.shape.id;

export const ordersService = {
  async list(input: OrderFilters, signal?: AbortSignal): Promise<OrderListResponse> {
    const { page, pageSize, status, search, fromDate, toDate } = orderFiltersSchema.parse(input);
    const response = await httpClient.get<unknown>("/orders", {
      params: {
        page,
        pageSize,
        ...(status ? { status } : {}),
        ...(search ? { search } : {}),
        ...(fromDate ? { fromDate } : {}),
        ...(toDate ? { toDate } : {}),
      },
      signal,
    });

    return orderListResponseSchema.parse(response.data);
  },

  async getById(id: string, signal?: AbortSignal): Promise<OrderDetail> {
    const orderId = orderIdSchema.parse(id);
    const response = await httpClient.get<unknown>(`/orders/${encodeURIComponent(orderId)}`, { signal });

    return orderDetailSchema.parse(response.data);
  },

  /** Buyer reports the bank transfer; the order moves to `PaymentSubmitted`. */
  async confirmTransfer(id: string): Promise<ConfirmTransferResponse> {
    const orderId = orderIdSchema.parse(id);
    const response = await httpClient.post<unknown>(`/orders/${encodeURIComponent(orderId)}/confirm-transfer`);

    return confirmTransferResponseSchema.parse(response.data);
  },

  /** Buyer cancels an order that is still `PendingPayment`. Repeating the call returns the earlier result. */
  async cancelPayment(id: string, request: CancelPaymentRequest): Promise<CancelPaymentResponse> {
    const orderId = orderIdSchema.parse(id);
    const response = await httpClient.post<unknown>(`/orders/${encodeURIComponent(orderId)}/cancel-payment`, request);

    return cancelPaymentResponseSchema.parse(response.data);
  },
};
