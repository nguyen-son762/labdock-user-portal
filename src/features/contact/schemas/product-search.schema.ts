import { z } from "zod";

export const productSearchItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  productNo: z.string(),
  brandName: z.string(),
  primaryImageUrl: z.string().nullish(),
  outOfStock: z.boolean().optional(),
});

export const productSearchResponseSchema = z.object({
  items: z.array(productSearchItemSchema),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});

export type ProductSearchItem = z.infer<typeof productSearchItemSchema>;
export type ProductSearchResponse = z.infer<typeof productSearchResponseSchema>;
