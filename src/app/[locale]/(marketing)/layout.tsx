import type { ReactNode } from "react";
import { connection } from "next/server";

import { SiteFooter } from "@/components/shared/site-footer";
import { getPublicCategories } from "@/features/categories/server";
import { getPublicCategoryTreeWithCounts } from "@/features/products/server";

import { MarketingHeader } from "./marketing-header";

export default async function MarketingLayout({ children }: { children: ReactNode }) {
  await connection();
  const categoriesResult = await getPublicCategories()
    .then(getPublicCategoryTreeWithCounts)
    .then((categories) => ({ categories, hasError: false }))
    .catch(() => ({ categories: [], hasError: true }));

  return (
    <div className="flex min-h-dvh flex-col">
      <MarketingHeader categories={categoriesResult.categories} categoriesError={categoriesResult.hasError} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
