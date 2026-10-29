import { clientEnv } from "@/config/client-env";
import type { PublicCategoryTreeNode } from "@/features/categories";
import { createServerApiRequestInit } from "@/lib/server-api-request";

import { products } from "./data/products-data";
import type { Product } from "./products.types";
import { publicProductDetailSchema } from "./schemas/product-detail.schema";
import { publicProductOriginsSchema } from "./schemas/product-origin.schema";
import {
  publicProductsPageSchema,
  type GetPublicProductsParams,
  type PublicProductsPage,
} from "./schemas/product-list.schema";
import { mapPublicProduct } from "./utils/map-public-product";

export { products };

export type ProductCatalogPage = Omit<PublicProductsPage, "items"> & { items: Product[] };

export class ProductNotFoundError extends Error {
  constructor(slug: string) {
    super(`Product not found: ${slug}`);
    this.name = "ProductNotFoundError";
  }
}

function createProductsQuery(params: GetPublicProductsParams): string {
  const query = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
  });

  if (params.brandIds?.length) query.set("brandIds", params.brandIds.join(","));
  if (params.categoryIds?.length) query.set("CategoryIds", params.categoryIds.join(","));
  if (params.origins?.length) query.set("Origins", params.origins.join(","));
  if (params.sort) query.set("Sort", params.sort);
  if (params.isNew !== undefined) query.set("IsNew", String(params.isNew));
  if (params.isOutstanding !== undefined) query.set("IsOutstanding", String(params.isOutstanding));

  return query.toString();
}

function getProductsCacheTag(params: GetPublicProductsParams): string {
  if (params.isOutstanding) return "products:outstanding";
  if (params.isNew) return "products:new";
  return "products:all";
}

export async function getPublicProducts(params: GetPublicProductsParams): Promise<PublicProductsPage> {
  const response = await fetch(
    `${clientEnv.NEXT_PUBLIC_API_BASE_URL}/products?${createProductsQuery(params)}`,
    await createServerApiRequestInit({
      revalidate: 300,
      tags: ["products", getProductsCacheTag(params)],
    }),
  );

  if (!response.ok) {
    throw new Error(`Unable to load products (${response.status}).`);
  }

  return publicProductsPageSchema.parse(await response.json());
}

export async function getProductCatalogPage(params: GetPublicProductsParams): Promise<ProductCatalogPage> {
  const page = await getPublicProducts(params);
  return { ...page, items: page.items.map(mapPublicProduct) };
}

export async function getPublicProductOrigins(): Promise<string[]> {
  const response = await fetch(
    `${clientEnv.NEXT_PUBLIC_API_BASE_URL}/origins`,
    await createServerApiRequestInit({ revalidate: 300, tags: ["origins"] }),
  );

  if (!response.ok) throw new Error(`Unable to load origins (${response.status}).`);

  return [...new Set(publicProductOriginsSchema.parse(await response.json()))];
}

export async function getCatalogCategoriesWithCounts<T extends { id: string; productCount?: number }>(
  categories: readonly T[],
): Promise<Array<T & { productCount?: number }>> {
  const results = await Promise.allSettled(
    categories.map(async (category) => {
      if (category.productCount !== undefined) return category;
      const page = await getPublicProducts({ page: 1, pageSize: 1, categoryIds: [category.id] });
      return { ...category, productCount: page.total };
    }),
  );

  return categories.map((category, index) => {
    const result = results[index];
    return result?.status === "fulfilled" ? result.value : category;
  });
}

export async function getPublicCategoryTreeWithCounts(
  categories: readonly PublicCategoryTreeNode[],
): Promise<PublicCategoryTreeNode[]> {
  const [countedCategories, children] = await Promise.all([
    getCatalogCategoriesWithCounts(categories),
    Promise.all(categories.map((category) => getPublicCategoryTreeWithCounts(category.children))),
  ]);

  return countedCategories.map((category, index) => ({ ...category, children: children[index] ?? [] }));
}

export async function getPublicProductBySlug(slug: string): Promise<Product> {
  const response = await fetch(
    `${clientEnv.NEXT_PUBLIC_API_BASE_URL}/products/${encodeURIComponent(slug)}`,
    await createServerApiRequestInit({
      revalidate: 300,
      tags: ["products", `product:${slug}`],
    }),
  );

  if (response.status === 404) throw new ProductNotFoundError(slug);
  if (!response.ok) throw new Error(`Unable to load product (${response.status}).`);

  return mapPublicProduct(publicProductDetailSchema.parse(await response.json()));
}
