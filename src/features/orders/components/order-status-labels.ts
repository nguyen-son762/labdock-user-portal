import type { OrderFilterStatus } from "../schemas/order.schema";

/** Translation keys under `Orders.statuses` for each status the list API can filter by. */
export const orderFilterStatusLabelKeys = {
  Draft: "draft",
  New: "new",
  PendingPayment: "pendingPayment",
  PaymentSubmitted: "paymentSubmitted",
  Paid: "paid",
  Processing: "processing",
  Shipped: "shipped",
  Delivered: "delivered",
  Cancelled: "cancelled",
  Failed: "failed",
} as const satisfies Record<OrderFilterStatus, string>;
