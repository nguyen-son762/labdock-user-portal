"use client";

import { Gallery, ShoppingCart, Trash } from "iconsax-reactjs";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { useCartQuery } from "../api/use-cart-query";
import { useRemoveCartItemMutation } from "../api/use-remove-cart-item-mutation";
import { calculateOrderTotals, formatCurrency } from "../data/checkout-data";
import { useTranslations } from "next-intl";

function createSelectionHref(pathname: string, selectedIds: string[]) {
  return selectedIds.length ? `${pathname}?items=${encodeURIComponent(selectedIds.join(","))}` : "#cart-products";
}

export function CartHeaderPopover() {
  const cartQuery = useCartQuery();
  const t = useTranslations("Header");
  const checkoutT = useTranslations("Checkout");
  const removeCartItem = useRemoveCartItemMutation();
  const [selection, setSelection] = useState<string[] | null>(null);
  const items = cartQuery.data ?? [];
  const selectedIds =
    selection === null ? items.map(({ id }) => id) : selection.filter((id) => items.some((item) => item.id === id));
  const totals = calculateOrderTotals(items);
  const hasSelection = selectedIds.length > 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="h-9 shrink-0 justify-start gap-2 rounded-full p-0 font-normal text-white transition-[height,padding,background-color] duration-200 hover:h-11 hover:px-1 hover:py-1 hover:bg-white/10 hover:text-white focus-visible:ring-white"
          aria-label={`Cart with ${items.length} products`}
        >
          <span className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10">
            <ShoppingCart className="size-4" variant="Bold" aria-hidden="true" />
            <span className="absolute -right-1 -top-0.5 flex size-4 items-center justify-center rounded-full bg-[#e57a00] text-[10px] font-semibold leading-none">
              {items.length}
            </span>
          </span>
          <span className="flex flex-col text-left leading-none">
            <span className="text-[13px] leading-[17px]">{t("orders")}</span>
            <strong className="whitespace-nowrap text-sm leading-[18px]">
              {formatCurrency(totals.subtotal, items[0]?.currency)}
            </strong>
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={12}
        className="w-[min(449px,calc(100vw-24px))] rounded-xl border border-[#dde2e8] bg-white p-0 text-[#051a50] shadow-[0_16px_40px_rgba(5,26,80,0.18)]"
      >
        <div className="flex items-center justify-between border-b border-[#edf0f2] px-4 py-3">
          <h2 className="text-lg font-semibold">{checkoutT("cart")}</h2>
          <nav aria-label={checkoutT("cartShortcuts")} className="flex items-center gap-4">
            <Link href="/cart" className="text-xs font-semibold text-[#164990] hover:underline">
              {checkoutT("viewCart")}
            </Link>
            <Link href="/orders" className="text-xs font-semibold text-[#164990] hover:underline">
              {checkoutT("viewOrders")}
            </Link>
          </nav>
        </div>
        <div className="divide-y divide-[#edf0f2] px-4">
          {cartQuery.isPending ? (
            <p className="py-6 text-center text-xs text-[#73798f]">{checkoutT("loadingCart")}</p>
          ) : null}
          {cartQuery.isError ? (
            <p role="alert" className="py-6 text-center text-xs text-[#d92d20]">
              {checkoutT("loadCartError")}
            </p>
          ) : null}
          {cartQuery.isSuccess && items.length === 0 ? (
            <p className="py-6 text-center text-xs text-[#73798f]">{checkoutT("emptyCartTitle")}</p>
          ) : null}
          {items.map((item) => (
            <div key={item.id} className="grid grid-cols-[16px_48px_1fr_32px] items-center gap-3 py-3">
              <Checkbox
                checked={selectedIds.includes(item.id)}
                onCheckedChange={(checked) =>
                  setSelection(
                    checked === true
                      ? [...new Set([...selectedIds, item.id])]
                      : selectedIds.filter((id) => id !== item.id),
                  )
                }
                aria-label={checkoutT("selectProduct", { name: item.productName })}
              />
              <div className="flex size-12 items-center justify-center overflow-hidden rounded-md border border-[#e7e9ed] bg-[#f8f9fa]">
                {item.image ? (
                  <Image src={item.image} alt="" width={48} height={48} className="size-full object-contain" />
                ) : (
                  <Gallery className="size-5 text-[#a3abbd]" aria-hidden="true" />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold">{item.productName}</p>
                <strong className="mt-1 block text-sm text-[#e57a00]">
                  {formatCurrency(item.unitPrice, item.currency)}
                </strong>
                <p className="mt-1 text-[11px] text-[#868da5]">
                  SKU: {item.sku} · x{item.quantity}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 rounded-full text-[#d92d20] hover:bg-[#fef3f2] hover:text-[#d92d20]"
                disabled={removeCartItem.isPending && removeCartItem.variables?.itemId === item.id}
                onClick={() => removeCartItem.mutate({ itemId: item.id })}
                aria-label={checkoutT("removeProduct", { name: item.productName })}
              >
                <Trash className="size-4" aria-hidden="true" />
              </Button>
            </div>
          ))}
          {removeCartItem.isError ? (
            <p role="alert" className="py-2 text-center text-xs text-[#d92d20]">
              {checkoutT("removeItemError")}
            </p>
          ) : null}
        </div>
        <div className="grid grid-cols-2 gap-3 border-t border-[#edf0f2] p-4">
          <Button
            asChild
            variant="outline"
            className="h-10 rounded-full border-[#2474ca] text-[#164990] hover:bg-[#eef6ff] hover:text-[#164990]"
          >
            <Link
              href={createSelectionHref("/request-quote", selectedIds)}
              aria-disabled={!hasSelection}
              tabIndex={hasSelection ? undefined : -1}
            >
              {checkoutT("requestQuote")}
            </Link>
          </Button>
          <Button asChild variant="brand" className="h-10 px-4 shadow-none">
            <Link
              href={createSelectionHref("/checkout", selectedIds)}
              aria-disabled={!hasSelection}
              tabIndex={hasSelection ? undefined : -1}
            >
              {checkoutT("proceedCheckout")}
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
