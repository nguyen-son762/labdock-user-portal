"use client";

import { ArrowLeft2 } from "iconsax-reactjs";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

import { useCartQuery } from "../api/use-cart-query";
import { useRemoveCartItemMutation } from "../api/use-remove-cart-item-mutation";
import { useUpdateCartItemMutation } from "../api/use-update-cart-item-mutation";
import { CartItemsTable } from "./cart-items-table";
import { CartOrderSummary } from "./cart-order-summary";
import { EmptyCartScreen } from "./empty-cart-screen";

export function CartScreen({ forceEmpty = false }: { forceEmpty?: boolean }) {
  const tHeader = useTranslations("Header");
  const t = useTranslations("Checkout");
  const cartQuery = useCartQuery();
  const updateCart = useUpdateCartItemMutation();
  const removeCart = useRemoveCartItemMutation();
  const [selection, setSelection] = useState<string[] | null>(null);
  const items = cartQuery.data ?? [];
  const selectedIds =
    selection === null ? items.map(({ id }) => id) : selection.filter((id) => items.some((item) => item.id === id));
  const selectedItems = items.filter((item) => selectedIds.includes(item.id));

  if (forceEmpty || (cartQuery.isSuccess && items.length === 0)) return <EmptyCartScreen />;

  if (cartQuery.isPending) {
    return (
      <div className="container min-h-[675px] py-10">
        <Skeleton className="h-[420px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="min-h-[675px] bg-[#f9fcff] py-10">
      <div className="container">
        <Breadcrumbs items={[{ label: tHeader("home"), href: "/" }, { label: t("cart") }]} />
        <h1 className="mt-3 text-3xl font-semibold text-[#164990]">{t("cart")}</h1>
        <Link
          href="/products"
          className="mt-6 inline-flex items-center gap-2 rounded text-xs text-[#164990] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#164990]"
        >
          <ArrowLeft2 className="size-4" aria-hidden="true" /> {t("backToProducts")}
        </Link>
        {cartQuery.isError ? <Alert className="mt-5">{t("loadCartError")}</Alert> : null}
        {updateCart.isError ? <Alert className="mt-5">{t("updateItemError")}</Alert> : null}
        {removeCart.isError ? <Alert className="mt-5">{t("removeItemError")}</Alert> : null}
        <div
          id="cart-products"
          className="mt-6 grid items-start gap-4 lg:grid-cols-[minmax(0,832px)_minmax(320px,392px)]"
        >
          <CartItemsTable
            items={items}
            selectedIds={selectedIds}
            onSelectedIdsChange={setSelection}
            pendingItemId={
              updateCart.isPending
                ? updateCart.variables?.itemId
                : removeCart.isPending
                  ? removeCart.variables?.itemId
                  : undefined
            }
            onQuantityChange={(itemId, quantity) => updateCart.mutate({ itemId, quantity })}
            onVariantChange={(itemId, variantId, quantity) => updateCart.mutate({ itemId, variantId, quantity })}
            onRemove={(itemId) => removeCart.mutate({ itemId })}
          />
          <CartOrderSummary items={selectedItems} />
        </div>
      </div>
    </div>
  );
}
