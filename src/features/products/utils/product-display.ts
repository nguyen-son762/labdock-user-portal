import { clientEnv } from "@/config/client-env";

import type { Product, ProductVariant } from "../products.types";

const fallbackProductImage = "/home/product-flask-round.png";

export function resolveProductMediaUrl(mediaUrl: string): string {
  if (/^https?:\/\//i.test(mediaUrl)) return mediaUrl;

  const relativePath = mediaUrl.replace(/^\/+/, "");
  if (!relativePath.startsWith("media/") && !relativePath.startsWith("public/")) {
    return mediaUrl.startsWith("/") ? mediaUrl : `/${mediaUrl}`;
  }

  const assetPath = relativePath.startsWith("public/") ? `media/${relativePath}` : relativePath;
  if (clientEnv.NEXT_PUBLIC_API_BASE_URL.startsWith("/")) return `/${assetPath}`;

  return new URL(assetPath, `${new URL(clientEnv.NEXT_PUBLIC_API_BASE_URL).origin}/`).toString();
}

export function getProductGallery(product: Product): string[] {
  const images = [...product.media]
    .sort((left, right) => Number(right.isPrimary) - Number(left.isPrimary) || left.sortOrder - right.sortOrder)
    .map((media) => resolveProductMediaUrl(media.url));

  return images.length ? images : [fallbackProductImage];
}

export function getPrimaryProductImage(product: Product): string {
  return getProductGallery(product)[0] ?? fallbackProductImage;
}

export function getProductVariantLabel(variant: ProductVariant): string {
  const selectionLabel = variant.selections
    .map((selection) => selection.value)
    .filter(Boolean)
    .join(" / ");
  return selectionLabel || variant.sku;
}

export function getDefaultProductVariant(product: Product): ProductVariant | undefined {
  return product.variants[0];
}

export function getPromotionalPrice(variant: ProductVariant): number {
  return Math.round((variant.unitPrice ?? 0) * (1 - variant.promotionPercent / 100) * 100) / 100;
}

export function formatProductPrice(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-SG", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

export function getProductVariantPresentation(product: Product, variant: ProductVariant | undefined) {
  const outOfStock = !variant?.isActive || variant.stockQty <= 0;
  const priceVisible = Boolean(product.priceVisible && variant?.priceVisible && variant.unitPrice !== null);
  const canPurchase = Boolean(
    priceVisible && variant && !outOfStock && variant.unitPrice !== null && variant.unitPrice > 0,
  );
  const hasPromotion = Boolean(
    priceVisible && variant && variant.unitPrice !== null && variant.unitPrice > 0 && variant.promotionPercent > 0,
  );

  return {
    price:
      priceVisible && variant
        ? formatProductPrice(getPromotionalPrice(variant), variant.currency)
        : "Contact for price",
    priceVisible,
    originalPrice:
      hasPromotion && variant && variant.unitPrice !== null
        ? formatProductPrice(variant.unitPrice, variant.currency)
        : undefined,
    discount: hasPromotion && variant ? `-${variant.promotionPercent}%` : undefined,
    outOfStock,
    canPurchase,
  } as const;
}

export function getProductCardPresentation(product: Product) {
  const variant = getDefaultProductVariant(product);
  const outOfStock = !product.variants.some((item) => item.isActive && item.stockQty > 0);
  const variantPresentation = getProductVariantPresentation(product, variant);

  return {
    variant,
    variantLabel: variant ? getProductVariantLabel(variant) : product.productNo,
    image: getPrimaryProductImage(product),
    price: variantPresentation.price,
    originalPrice: variantPresentation.originalPrice,
    discount: variantPresentation.discount,
    outOfStock,
    canPurchase: variantPresentation.canPurchase,
    badge: outOfStock ? "Out of stock" : product.isOutstanding ? "Best Seller" : product.isNew ? "New" : undefined,
  } as const;
}
