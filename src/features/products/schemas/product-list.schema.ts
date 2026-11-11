import { z } from "zod";

import { publicProductDetailSchema } from "./product-detail.schema";

const guidSchema = z.string().regex(/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i, "Invalid identifier.");

export const publicProductListItemSchema = z.object({
  id: guidSchema,
  name: z.string().min(1),
  slug: z.string().min(1),
  productNo: z.string().min(1),
  brandName: z.string().min(1),
  primaryImageUrl: z.string().min(1).nullable(),
  priceVisible: z.boolean(),
  fromPrice: z.number().nonnegative().nullable(),
  currency: z.string().length(3),
  outOfStock: z.boolean(),
  promotionPercent: z
    .number()
    .min(0)
    .max(100)
    .nullish()
    .transform((value) => value ?? 0),
  publishedAt: z.iso.datetime({ offset: true }),
  isNew: z.boolean(),
  isOutstanding: z.boolean(),
});

export const publicProductsPageSchema = z.object({
  items: z.array(z.union([publicProductDetailSchema, publicProductListItemSchema])),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});

export type PublicProductListItem = z.infer<typeof publicProductListItemSchema>;
export type PublicProductsPage = z.infer<typeof publicProductsPageSchema>;

export type GetPublicProductsParams = {
  page: number;
  pageSize: number;
  brandIds?: readonly string[];
  categoryIds?: readonly string[];
  origins?: readonly string[];
  sort?: string;
  isNew?: boolean;
  isOutstanding?: boolean;
};
