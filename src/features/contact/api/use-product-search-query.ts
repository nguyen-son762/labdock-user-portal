import { useQuery } from "@tanstack/react-query";

import { productSearchService } from "./product-search.service";

export const MIN_PRODUCT_SEARCH_LENGTH = 2;

export function useProductSearchQuery(query: string) {
  const term = query.trim();
  return useQuery({
    queryKey: ["contact", "product-search", term],
    queryFn: ({ signal }) => productSearchService.search(term, signal),
    enabled: term.length >= MIN_PRODUCT_SEARCH_LENGTH,
    staleTime: 60_000,
  });
}
