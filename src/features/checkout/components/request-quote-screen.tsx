"use client";

import { ArrowLeft2 } from "iconsax-reactjs";
import { Link } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

import { useCartQuery } from "../api/use-cart-query";
import { useRemoveCartItemMutation } from "../api/use-remove-cart-item-mutation";
import { useSubmitQuoteMutation } from "../api/use-submit-quote-mutation";
import { useUpdateCartItemMutation } from "../api/use-update-cart-item-mutation";
import type { QuoteContactValues } from "../schemas/quote.schema";
import { CartItemsTable } from "./cart-items-table";
import { EmptyCartScreen } from "./empty-cart-screen";
import { QuoteContactForm } from "./quote-contact-form";

export function RequestQuoteScreen({ initialItemIds }: { initialItemIds?: string[] }) {
  const tHeader = useTranslations("Header");
  const t = useTranslations("Checkout");
  const router = useRouter();
  const cartQuery = useCartQuery();
  const updateCart = useUpdateCartItemMutation();
  const removeCart = useRemoveCartItemMutation();
  const submitQuote = useSubmitQuoteMutation();
  const [selection, setSelection] = useState<string[] | null>(null);
  const cartItems = cartQuery.data ?? [];
  const items = initialItemIds?.length ? cartItems.filter((item) => initialItemIds.includes(item.id)) : cartItems;
  const selectedIds =
    selection === null ? items.map(({ id }) => id) : selection.filter((id) => items.some((item) => item.id === id));

  const handleSubmit = (contact: QuoteContactValues) => {
    if (submitQuote.isPending || selectedIds.length === 0) return;
    submitQuote.mutate(
      { contact, itemIds: selectedIds, idempotencyKey: crypto.randomUUID() },
      {
        onSuccess: ({ reference }) => router.push(`/request-quote/success?reference=${encodeURIComponent(reference)}`),
      },
    );
  };

  if (cartQuery.isPending)
    return (
      <div className="container min-h-[675px] py-10">
        <Skeleton className="h-[560px] w-full rounded-xl" />
      </div>
    );
  if (cartQuery.isSuccess && items.length === 0) return <EmptyCartScreen />;

  return (
    <div className="min-h-[873px] bg-[#f5f8fb] py-10">
      <div className="container">
        {cartQuery.isError ? <Alert>{t("loadCartError")}</Alert> : null}
        {removeCart.isError ? <Alert>{t("removeItemError")}</Alert> : null}
        <Breadcrumbs
          items={[
            { label: tHeader("home"), href: "/" },
            { label: t("cart"), href: "/cart" },
            { label: t("requestQuote") },
          ]}
        />
        <h1 className="mt-3 text-3xl font-semibold text-[#164990]">{t("requestQuote")}</h1>
        <Link
          href="/products"
          className="mt-6 inline-flex items-center gap-2 rounded text-xs text-[#164990] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#164990]"
        >
          <ArrowLeft2 className="size-4" aria-hidden="true" /> {t("backToProducts")}
        </Link>
        <div className="mt-6 grid items-start gap-4 lg:grid-cols-[minmax(0,821px)_minmax(340px,403px)]">
          {updateCart.isError ? <Alert className="lg:col-span-2">{t("updateItemError")}</Alert> : null}
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
          <QuoteContactForm
            onSubmit={handleSubmit}
            pending={submitQuote.isPending}
            error={
              selectedIds.length === 0
                ? "Select at least one product to request a quote."
                : submitQuote.isError
                  ? "We could not submit your request. Please try again."
                  : undefined
            }
          />
        </div>
      </div>
    </div>
  );
}
