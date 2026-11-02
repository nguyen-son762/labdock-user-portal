"use client";

import { MainHeader } from "@/components/layout/main-header";
import { HeaderAccountMenu, useAuthSessionQuery } from "@/features/auth";
import type { PublicCategoryTreeNode } from "@/features/categories";
import { CompactCartLink } from "@/features/checkout";
import { useCurrentUserQuery } from "@/features/profile";

type AuthHeaderProps = {
  categories: readonly PublicCategoryTreeNode[];
  categoriesError?: boolean;
};

export function AuthHeader({ categories, categoriesError = false }: AuthHeaderProps) {
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
      compactCartContent={<CompactCartLink />}
      categories={categories}
      categoriesError={categoriesError}
    />
  );
}
