import { z } from "zod";

// Accept GUID-shaped values even if a documented sample omits RFC UUID variant bits.
const guidSchema = z.guid();
const dateTimeSchema = z.iso.datetime({ offset: true });
const nullableNumberSchema = z
  .number()
  .nullish()
  .transform((value) => value ?? null);
const nullableTextSchema = z
  .string()
  .trim()
  .nullish()
  .transform((value) => value || null);

export const rfqStatusSchema = z.string().trim().min(1);

/** Statuses the list API reports counts for and accepts as a filter, in display order. */
export const RFQ_FILTER_STATUSES = ["Pending", "Quoted", "Accepted", "Declined", "Expired"] as const;

export const rfqFilterStatusSchema = z.enum(RFQ_FILTER_STATUSES);

export const rfqSummarySchema = z.object({
  id: guidSchema,
  rfqNumber: z.string().min(1),
  status: rfqStatusSchema,
  createdAt: dateTimeSchema,
  lastActionedAt: dateTimeSchema,
  quoteExpiresAt: dateTimeSchema.nullish().transform((value) => value ?? null),
  itemCount: z.number().int().nonnegative(),
  estimatedValue: nullableNumberSchema,
  quotedTotal: nullableNumberSchema,
  currency: nullableTextSchema,
});

export const rfqListSummarySchema = z.object({
  totalRfqs: z.number().int().nonnegative(),
  countsByStatus: z.array(
    z.object({
      status: rfqStatusSchema,
      count: z.number().int().nonnegative(),
    }),
  ),
});

export const rfqListResponseSchema = z.object({
  items: z.array(rfqSummarySchema),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  summary: rfqListSummarySchema.nullish().transform((value) => value ?? null),
});

export const rfqItemSchema = z.object({
  id: guidSchema,
  variantId: guidSchema,
  // The API returns an empty name when the product details are unavailable.
  productName: nullableTextSchema,
  variantName: nullableTextSchema,
  sku: nullableTextSchema,
  quantity: z.number().int().positive(),
  listedUnitPrice: nullableNumberSchema,
  estimatedValue: nullableNumberSchema,
  quoteUnitPrice: nullableNumberSchema,
});

export const rfqContactSchema = z.object({
  fullName: nullableTextSchema,
  phone: nullableTextSchema,
  email: nullableTextSchema,
  companyName: nullableTextSchema,
  region: nullableTextSchema,
});

export const rfqDetailSchema = rfqSummarySchema.omit({ itemCount: true }).extend({
  message: nullableTextSchema,
  contact: rfqContactSchema.nullish().transform((value) => value ?? null),
  items: z.array(rfqItemSchema),
});

export const rfqFiltersSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(10),
  status: rfqFilterStatusSchema.optional(),
  search: z.string().trim().max(100).optional(),
  fromDate: z.iso.date().optional(),
  toDate: z.iso.date().optional(),
});

export type RfqStatus = z.infer<typeof rfqStatusSchema>;
export type RfqFilterStatus = z.infer<typeof rfqFilterStatusSchema>;
export type RfqSummary = z.infer<typeof rfqSummarySchema>;
export type RfqListSummary = z.infer<typeof rfqListSummarySchema>;
export type RfqItem = z.infer<typeof rfqItemSchema>;
export type RfqDetail = z.infer<typeof rfqDetailSchema>;
export type RfqFilters = z.infer<typeof rfqFiltersSchema>;
export type RfqListResponse = z.infer<typeof rfqListResponseSchema>;
