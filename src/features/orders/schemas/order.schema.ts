import { z } from "zod";

// The API's documented sample IDs don't include an RFC UUID variant nibble,
// so validate GUID shape without enforcing the UUID version/variant bits.
const guidSchema = z.guid();
const currencySchema = z.string().length(3);
const dateTimeSchema = z.iso.datetime({ offset: true });

/** Numeric `OrderStatus` values as of the 2026-11-12 API change. The API should be sent and compared by name. */
const apiOrderStatuses: Readonly<Record<number, string>> = {
  1: "Draft",
  2: "New",
  3: "PendingPayment",
  4: "PaymentSubmitted",
  5: "Paid",
  6: "Processing",
  7: "Shipped",
  8: "Delivered",
  9: "Cancelled",
  10: "Failed",
};

export const orderStatusSchema = z
  .union([z.string().trim().min(1), z.number().int().min(1).max(10)])
  .transform((status) => (typeof status === "number" ? (apiOrderStatuses[status] ?? `Status ${status}`) : status));

export const orderSummarySchema = z.object({
  id: guidSchema,
  orderNumber: z.string().min(1),
  status: orderStatusSchema,
  subtotal: z.number().nonnegative(),
  tax: z.number().nonnegative(),
  shippingFee: z.number().nonnegative(),
  additionalFeeTotal: z.number().nonnegative(),
  platformFee: z.number().nonnegative(),
  total: z.number().nonnegative(),
  currency: currencySchema,
  createdAt: dateTimeSchema,
});

/** Statuses the list API accepts as a filter, in the order the API reports their counts. */
export const ORDER_FILTER_STATUSES = [
  "Draft",
  "New",
  "PendingPayment",
  "PaymentSubmitted",
  "Paid",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
  "Failed",
] as const;

export const orderFilterStatusSchema = z.enum(ORDER_FILTER_STATUSES);

export const orderListSummarySchema = z.object({
  totalSpent: z.number().nonnegative(),
  // The API returns null when there is no spend to report a currency for.
  currency: currencySchema.nullish().transform((value) => value ?? null),
  totalOrders: z.number().int().nonnegative(),
  countsByStatus: z.array(
    z.object({
      status: orderStatusSchema,
      count: z.number().int().nonnegative(),
    }),
  ),
});

export const orderListResponseSchema = z.object({
  items: z.array(orderSummarySchema),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  summary: orderListSummarySchema.nullish().transform((value) => value ?? null),
});

export const orderInvoiceLineSchema = z.object({
  productName: z.string().min(1),
  sku: z.string().min(1),
  unitPrice: z.number().nonnegative(),
  quantity: z.number().int().positive(),
  lineTotal: z.number().nonnegative(),
});

export const orderDetailSchema = orderSummarySchema.omit({ subtotal: true, tax: true, platformFee: true }).extend({
  subtotal: z.number().nonnegative(),
  tax: z.number().nonnegative(),
  platformFee: z.number().nonnegative(),
  platformFeeRateSnap: z.number().nonnegative().nullable(),
  shippingSnapshotJson: z.string(),
  refCode: z
    .string()
    .trim()
    .nullish()
    .transform((value) => value ?? ""),
  paymentExpiresAt: dateTimeSchema.nullish().transform((value) => value ?? null),
  companyName: z
    .string()
    .trim()
    .nullish()
    .transform((value) => value ?? ""),
  businessRegistrationNo: z
    .string()
    .trim()
    .nullish()
    .transform((value) => value ?? ""),
  qrImageUrl: z
    .union([z.literal(""), z.url({ protocol: /^https?$/ })])
    .nullish()
    .transform((value) => value ?? ""),
  invoice: z.object({
    orderNumber: z.string().min(1),
    createdAt: dateTimeSchema,
    buyerEmail: z.string().min(1),
    lines: z.array(orderInvoiceLineSchema),
    subtotal: z.number().nonnegative(),
    tax: z.number().nonnegative(),
    platformFee: z.number().nonnegative(),
    total: z.number().nonnegative(),
    currency: currencySchema,
    status: orderStatusSchema,
  }),
});

export const orderFiltersSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(50).default(10),
  status: orderFilterStatusSchema.optional(),
  search: z.string().trim().max(100).optional(),
  fromDate: z.iso.date().optional(),
  toDate: z.iso.date().optional(),
});

export const confirmTransferResponseSchema = z.object({
  orderId: guidSchema,
  refCode: z.string(),
  paymentStatus: z.string().min(1),
  buyerMarkedTransferredAt: dateTimeSchema,
});

export const cancelPaymentResponseSchema = z.object({
  orderId: guidSchema,
  orderStatus: orderStatusSchema,
  paymentStatus: z.string().min(1),
});

/** Reasons offered in the cancel-payment dialog, in display order. */
export const cancelPaymentReasons = [
  "change_products",
  "change_delivery_address",
  "change_payment_method",
  "better_price",
  "no_longer_needed",
  "other",
] as const;

export type CancelPaymentReason = (typeof cancelPaymentReasons)[number];

// TODO: align field names with the backend contract once it is final.
export type CancelPaymentRequest = {
  reason: CancelPaymentReason;
  comment?: string;
};

export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type OrderSummary = z.infer<typeof orderSummarySchema>;
export type OrderInvoiceLine = z.infer<typeof orderInvoiceLineSchema>;
export type OrderDetail = z.infer<typeof orderDetailSchema>;
export type OrderFilters = z.infer<typeof orderFiltersSchema>;
export type OrderListResponse = z.infer<typeof orderListResponseSchema>;
export type OrderListSummary = z.infer<typeof orderListSummarySchema>;
export type OrderFilterStatus = z.infer<typeof orderFilterStatusSchema>;
export type ConfirmTransferResponse = z.infer<typeof confirmTransferResponseSchema>;
export type CancelPaymentResponse = z.infer<typeof cancelPaymentResponseSchema>;
