import { z } from "zod";

import type { Product } from "../products.types";

export const RECENT_VIEWED_STORAGE_KEY = "labdock:recent-viewed-products:v1";
export const MAX_RECENT_VIEWED_PRODUCTS = 6;
/** The current product is stored too but never displayed, so keep one extra entry. */
const MAX_STORED_RECENT_VIEWED_PRODUCTS = MAX_RECENT_VIEWED_PRODUCTS + 1;

const recentViewedProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string().min(1),
  productNo: z.string(),
  brandName: z.string(),
  priceVisible: z.boolean(),
  imageUrl: z.string().nullable(),
  isNew: z.boolean(),
  isOutstanding: z.boolean(),
  variants: z.array(
    z.object({
      id: z.string(),
      sku: z.string(),
      priceVisible: z.boolean(),
      unitPrice: z.number().nullable(),
      promotionPercent: z.number(),
      currency: z.string(),
      stockQty: z.number(),
      isActive: z.boolean(),
    }),
  ),
});

const recentViewedProductsSchema = z.array(recentViewedProductSchema);

export type RecentViewedProduct = z.infer<typeof recentViewedProductSchema>;

/** Keeps only the fields a product card needs so session storage stays small. */
export function toRecentViewedProduct(product: Product): RecentViewedProduct {
  const primaryMedia =
    product.media.find((media) => media.isPrimary) ??
    [...product.media].sort((left, right) => left.sortOrder - right.sortOrder)[0];

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    productNo: product.productNo,
    brandName: product.brandName,
    priceVisible: product.priceVisible,
    imageUrl: primaryMedia?.url ?? null,
    isNew: product.isNew,
    isOutstanding: product.isOutstanding,
    variants: product.variants.map(
      ({ id, sku, priceVisible, unitPrice, promotionPercent, currency, stockQty, isActive }) => ({
        id,
        sku,
        priceVisible,
        unitPrice,
        promotionPercent,
        currency,
        stockQty,
        isActive,
      }),
    ),
  };
}

export function fromRecentViewedProduct(product: RecentViewedProduct): Product {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    productNo: product.productNo,
    status: "Published",
    brandName: product.brandName,
    notes: "",
    description: product.name,
    specialRequirement: false,
    restrictedCondition: false,
    priceVisible: product.priceVisible,
    casNumber: "",
    specifications: [],
    variants: product.variants.map((variant) => ({
      ...variant,
      rfqBasePrice: variant.unitPrice,
      selections: [],
    })),
    media: product.imageUrl
      ? [{ id: product.id, url: product.imageUrl, contentType: "image/*", sortOrder: 0, isPrimary: true }]
      : [],
    documents: [],
    references: [],
    related: [],
    certificates: [],
    isNew: product.isNew,
    isOutstanding: product.isOutstanding,
  };
}

/** Parses untrusted storage content; malformed data is treated as an empty history. */
export function parseRecentViewedProducts(rawValue: string | null): RecentViewedProduct[] {
  if (!rawValue) return [];
  try {
    const result = recentViewedProductsSchema.safeParse(JSON.parse(rawValue));
    return result.success ? result.data.slice(0, MAX_STORED_RECENT_VIEWED_PRODUCTS) : [];
  } catch {
    return [];
  }
}

/** Moves the viewed product to the front, removing duplicates and trimming the history. */
export function addRecentViewedProduct(
  history: readonly RecentViewedProduct[],
  product: RecentViewedProduct,
): RecentViewedProduct[] {
  return [product, ...history.filter((item) => item.id !== product.id)].slice(0, MAX_STORED_RECENT_VIEWED_PRODUCTS);
}

export function getDisplayedRecentViewedProducts(
  history: readonly RecentViewedProduct[],
  currentProductId: string,
): RecentViewedProduct[] {
  return history.filter((item) => item.id !== currentProductId).slice(0, MAX_RECENT_VIEWED_PRODUCTS);
}
