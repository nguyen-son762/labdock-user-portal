import { httpClient } from "@/lib/http-client";

import type { Product } from "../products.types";
import { publicProductDetailSchema } from "../schemas/product-detail.schema";
import { mapPublicProduct } from "../utils/map-public-product";

export const productsService = {
  async getBySlug(slug: string, signal?: AbortSignal): Promise<Product> {
    const response = await httpClient.get<unknown>(`/products/${encodeURIComponent(slug)}`, { signal });
    return mapPublicProduct(publicProductDetailSchema.parse(response.data));
  },
};
