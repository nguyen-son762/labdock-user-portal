"use client";

import { MainHeader } from "@/components/layout/main-header";
import { HeaderAccountMenu, useAuthSessionQuery } from "@/features/auth";
import type { PublicCategoryTreeNode } from "@/features/categories";
import { CartHeaderPopover, CompactCartLink } from "@/features/checkout";
import { useCurrentUserQuery } from "@/features/profile";

type MarketingHeaderProps = {
  categories: readonly PublicCategoryTreeNode[];
  categoriesError?: boolean;
};

export function MarketingHeader({ categories, categoriesError = false }: MarketingHeaderProps) {
  const sessionQuery = useAuthSessionQuery();
  const currentUserQuery = useCurrentUserQuery(sessionQuery.data?.authenticated === true);
  const account = currentUserQuery.data
    ? { fullName: currentUserQuery.data.fullName, email: currentUserQuery.data.email }
    : undefined;

  return (
    <MainHeader
      account={account}
      isAuthenticated={sessionQuery.data?.authenticated === true}
      accountContent={account ? <HeaderAccountMenu account={account} /> : undefined}
      compactAccountContent={account ? <HeaderAccountMenu account={account} compact /> : undefined}
      cartContent={<CartHeaderPopover />}
      compactCartContent={<CompactCartLink />}
      categories={categories}
      categoriesError={categoriesError}
    />
  );
}
