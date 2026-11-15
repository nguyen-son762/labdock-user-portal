import { useQuery } from "@tanstack/react-query";

import { productsService } from "@/features/products/api/products.service";

export function useQuoteProductVariantsQuery(slug: string) {
  return useQuery({
    queryKey: ["contact", "quote-product", slug],
    queryFn: ({ signal }) => productsService.getBySlug(slug, signal),
    enabled: slug.length > 0,
    staleTime: 5 * 60_000,
    select: (product) => product.variants.filter((variant) => variant.isActive),
  });
}
