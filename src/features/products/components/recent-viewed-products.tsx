"use client";

import { useTranslations } from "next-intl";

import { useRecentViewedProducts } from "../hooks/use-recent-viewed-products";
import type { RecentViewedProduct } from "../utils/recent-viewed-products";
import { ProductShelf } from "./product-shelf";

export function RecentViewedProducts({ product }: { product: RecentViewedProduct }) {
  const t = useTranslations("Product");
  const recentProducts = useRecentViewedProducts(product);

  if (!recentProducts.length) return null;

  return <ProductShelf title={t("recentViewed")} products={recentProducts} tone="blue" />;
}
