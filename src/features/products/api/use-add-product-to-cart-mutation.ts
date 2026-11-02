import { useMutation } from "@tanstack/react-query";

import { useAddCartItemMutation } from "@/features/checkout";

import { createCartItemFromProduct } from "../utils/product-cart";
import { productsService } from "./products.service";

export function useAddProductToCartMutation() {
  const addCartItem = useAddCartItemMutation();

  return useMutation({
    mutationFn: async (slug: string) => {
      const product = await productsService.getBySlug(slug);
      return addCartItem.mutateAsync(createCartItemFromProduct(product, { quantity: 1 }));
    },
    retry: false,
  });
}
