import { httpClient } from "@/lib/http-client";

import { productSearchResponseSchema, type ProductSearchResponse } from "../schemas/product-search.schema";

export const productSearchService = {
  async search(query: string, signal?: AbortSignal): Promise<ProductSearchResponse> {
    const response = await httpClient.get<unknown>("/search", { params: { q: query.trim() }, signal });
    return productSearchResponseSchema.parse(response.data);
  },
};
