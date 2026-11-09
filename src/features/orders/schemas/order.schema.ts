import { z } from "zod";

// The API's documented sample IDs don't include an RFC UUID variant nibble,
// so validate GUID shape without enforcing the UUID version/variant bits.
const guidSchema = z.guid();
const currencySchema = z.string().length(3);
const dateTimeSchema = z.iso.datetime({ offset: true });

const apiOrderStatuses: Readonly<Record<number, string>> = {
  0: "Draft",
  1: "New",
  2: "Processing",
  3: "Shipped",
  4: "Delivered",
  5: "Cancelled",
};

export const orderStatusSchema = z
  .union([z.string().trim().min(1), z.number().int().min(0).max(5)])
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

export const orderListResponseSchema = z.object({
  items: z.array(orderSummarySchema),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
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
  pageSize: z.number().int().positive().max(100).default(10),
});

export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type OrderSummary = z.infer<typeof orderSummarySchema>;
export type OrderInvoiceLine = z.infer<typeof orderInvoiceLineSchema>;
export type OrderDetail = z.infer<typeof orderDetailSchema>;
export type OrderFilters = z.infer<typeof orderFiltersSchema>;
export type OrderListResponse = z.infer<typeof orderListResponseSchema>;
