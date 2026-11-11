"use client";

import { Add, ArrowRight, Bookmark, Box1, Minus, ShoppingCart, Verify } from "iconsax-reactjs";
import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAddCartItemMutation } from "@/features/checkout";
import { Link, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/class-names";

import type { Product } from "../products.types";
import { createCartItemFromProduct } from "../utils/product-cart";
import {
  getDefaultProductVariant,
  getProductVariantLabel,
  getProductVariantPresentation,
} from "../utils/product-display";

function ProductFacts({ product }: { product: Product }) {
  const t = useTranslations("Product");
  const facts = [
    { label: t("brand"), value: product.brandName, icon: Bookmark },
    { label: t("categoryNumberLabel"), value: product.productNo, icon: Box1 },
    { label: t("supplierItemNo"), value: product.supplierItemNo || t("notAvailable"), icon: Box1 },
    { label: t("casNumber"), value: product.casNumber || t("notAvailable"), icon: Box1 },
  ];

  return (
    <dl className="grid grid-cols-1 gap-x-4 gap-y-2 border-y border-[#e9eaeb] py-4 sm:grid-cols-2">
      {facts.map(({ label, value, icon: Icon }) => (
        <div key={label} className="flex min-w-0 items-center gap-1 text-sm">
          <Icon className="size-4 shrink-0 text-[#868da5]" aria-hidden="true" />
          <dt className="shrink-0 text-[#868da5]">{label}</dt>
          <dd className="truncate font-semibold text-[#051a50]">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ProductPurchasePanel({ product }: { product: Product }) {
  const t = useTranslations("Product");
  const productCardT = useTranslations("ProductCard");
  const router = useRouter();
  const addCartItem = useAddCartItemMutation();
  const defaultVariant = getDefaultProductVariant(product);
  const [selectedVariantId, setSelectedVariantId] = useState(defaultVariant?.id);
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState("");
  const selectedVariant = product.variants.find((variant) => variant.id === selectedVariantId) ?? defaultVariant;
  const presentation = getProductVariantPresentation(product, selectedVariant);
  const maxQuantity = Math.min(999, selectedVariant?.stockQty ?? 0);
  const variantLabel =
    selectedVariant?.selections
      .map((selection) => selection.attributeName)
      .filter((value, index, values) => Boolean(value) && values.indexOf(value) === index)
      .join(" / ") || t("productOption");
  const notices = product.notes
    .split(/\r\n|\r|\n/)
    .map((notice) => notice.trim())
    .filter(Boolean);

  function addProduct(destination?: "/checkout" | "/request-quote") {
    if (addCartItem.isPending || !presentation.canPurchase || !selectedVariant) return;
    setStatus("");
    addCartItem.mutate(createCartItemFromProduct(product, { quantity, variantId: selectedVariant.id }), {
      onSuccess: (items) => {
        if (destination) {
          const cartItem = items.find((item) => item.productId === product.id && item.variantId === selectedVariant.id);
          if (cartItem) {
            router.push(`${destination}?items=${encodeURIComponent(cartItem.id)}`);
          } else {
            router.push("/cart");
          }
          return;
        }
        setStatus(productCardT("added", { name: product.name }));
      },
      onError: () => setStatus(productCardT("error")),
    });
  }

  return (
    <aside
      className="h-full overflow-hidden rounded-2xl border border-[#eaecf0] bg-white"
      aria-label={t("purchaseOptions")}
    >
      <div className="p-5 lg:p-6">
        {presentation.discount ? (
          <span className="inline-flex rounded bg-gradient-to-l from-[#e16555] to-[#ce2823] px-1.5 py-1 text-sm font-medium leading-none text-white shadow-[0_0_25px_rgba(239,163,59,0.3)] mb-2">
            {presentation.discount}
          </span>
        ) : null}
        <h1 className="text-2xl font-semibold leading-[1.3] text-[#051a50]">{product.name}</h1>
        <p className="mt-4 flex flex-wrap items-baseline gap-2 text-[32px] font-bold leading-tight text-[#e57a00]">
          {presentation.priceVisible ? (
            <>
              {presentation.price}
              {presentation.originalPrice ? (
                <span className="text-lg font-normal text-[#a3abbd] line-through">{presentation.originalPrice}</span>
              ) : null}
            </>
          ) : (
            <Link href="/login" className="hover:underline focus-visible:rounded-sm focus-visible:outline-none">
              {t("loginToViewPrice")}
            </Link>
          )}
        </p>
        <div className="mt-5">
          <ProductFacts product={product} />
        </div>

        {product.variants.length ? (
          <fieldset className="mt-4 flex flex-col gap-3 border-b border-[#e9eaeb] pb-4 sm:flex-row sm:items-center">
            <legend className="contents">
              <span className="flex-1 text-sm font-semibold text-[#051a50]">{variantLabel}</span>
            </legend>
            <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(72px,1fr))] gap-2 sm:w-[240px]">
              {product.variants.map((variant) => {
                const label = getProductVariantLabel(variant);
                return (
                  <Button
                    key={variant.id}
                    type="button"
                    variant="outline"
                    aria-pressed={selectedVariant?.id === variant.id}
                    onClick={() => {
                      setSelectedVariantId(variant.id);
                      setQuantity((value) => Math.min(value, Math.max(1, variant.stockQty)));
                    }}
                    className={cn(
                      "h-8 min-w-[72px] rounded-lg border-[#d4d4d4] bg-white px-2 text-sm text-[#404040] shadow-none",
                      selectedVariant?.id === variant.id &&
                        "border-[#164990] bg-[#164990] text-white hover:bg-[#164990] hover:text-white",
                    )}
                  >
                    {label}
                    {!variant.isActive || variant.stockQty <= 0 ? ` ${t("out")}` : ""}
                  </Button>
                );
              })}
            </div>
          </fieldset>
        ) : null}

        <div className="mt-4 flex flex-col gap-3 border-b border-[#e9eaeb] pb-4 sm:flex-row sm:items-center">
          <Label className="flex-1 text-sm font-semibold text-[#051a50]">{t("quantity")}</Label>
          <div className="flex h-11 w-full items-center rounded-lg border border-[#e9eaeb] sm:w-[240px]">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={t("decreaseQuantity")}
              disabled={!presentation.canPurchase || quantity <= 1}
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              className="h-full w-10 rounded-none border-r border-[#e9eaeb] text-[#164990]"
            >
              <Minus className="size-4" aria-hidden="true" />
            </Button>
            <output
              aria-label={t("quantity")}
              aria-live="polite"
              className="min-w-20 flex-1 text-center text-base font-semibold text-[#051a50]"
            >
              {quantity}
            </output>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={t("increaseQuantity")}
              disabled={!presentation.canPurchase || quantity >= maxQuantity}
              onClick={() => setQuantity((value) => Math.min(maxQuantity, value + 1))}
              className="h-full w-10 rounded-none border-l border-[#e9eaeb] text-[#164990]"
            >
              <Add className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Button
            type="button"
            variant="brand"
            disabled={addCartItem.isPending || !presentation.canPurchase}
            onClick={() => addProduct("/checkout")}
            className="h-11 justify-between pl-5 pr-1.5"
          >
            <span className="flex-1">{addCartItem.isPending ? t("updating") : productCardT("buyNow")}</span>
            <span className="flex size-8 items-center justify-center rounded-full bg-[#efa33b] shadow-[0_0_15px_rgba(229,122,0,0.5)]">
              <ArrowRight className="size-4" aria-hidden="true" />
            </span>
          </Button>
          <Button
            type="button"
            disabled={addCartItem.isPending || !presentation.canPurchase}
            onClick={() => addProduct()}
            className="h-11 justify-between rounded-full bg-gradient-to-r from-[#2f7bc4] to-[#0f3678] pl-5 pr-1.5"
          >
            <span className="flex-1">{t("addToCartAction")}</span>
            <span className="flex size-8 items-center justify-center rounded-full bg-[#1f5fa8]">
              <ShoppingCart className="size-4" aria-hidden="true" />
            </span>
          </Button>
        </div>
        <p className="my-2 text-center text-sm text-[#051a50]">{t("or")}</p>
        <Button
          type="button"
          variant="outline"
          disabled={addCartItem.isPending}
          onClick={() => {
            if (!presentation.canPurchase) {
              router.push(`/contact-us?type=quote&product=${encodeURIComponent(product.slug)}`);
              return;
            }
            addProduct("/request-quote");
          }}
          className="h-11 w-full rounded-full border-[#2f7bc4] text-[#164990] hover:bg-[#eef6fc] hover:text-[#164990]"
        >
          {t("quoteAction")}
        </Button>
        {status ? (
          <p role="status" aria-live="polite" className="mt-3 text-xs text-[#299a86]">
            {status}
          </p>
        ) : null}

        {product.certificates.length ? (
          <div
            className={cn(
              "mt-4 flex flex-wrap items-center justify-start gap-4 rounded-[6px] bg-[#effaf3] px-2 py-1 text-sm text-[#1a1a1a]",
              product.certificates.length === 3 && "justify-between gap-2",
            )}
            aria-label={t("certificates")}
          >
            {product.certificates.map((certificate) => (
              <span key={certificate.id} className="inline-flex items-center gap-2.5">
                <Verify className="size-4 text-[#3eb584]" variant="Bold" aria-hidden="true" />
                {certificate.name}
              </span>
            ))}
          </div>
        ) : null}
        <div
          className="mt-2 flex items-center gap-2 rounded-md bg-[#f5f7f8] py-1 pl-3 pr-1"
          aria-label={t("paymentMethods")}
        >
          <span className="min-w-0 flex-1 text-sm text-[#5e6375]">{t("securedPaymentWith")}</span>
          {[
            { name: "Visa", src: "/icon/visa.svg" },
            { name: "PayNow", src: "/icon/pay_now.svg" },
            { name: "Mastercard", src: "/icon/pay.svg" },
          ].map((payment) => (
            <Image
              src={payment.src}
              alt={payment.name}
              key={payment.name}
              width={40}
              height={28}
              className="h-7 w-10 object-cover"
            />
          ))}
        </div>
      </div>
      {notices.length ? (
        <div className="border-t border-[#e9eaeb] p-6 pt-4">
          <h2 className="text-sm font-semibold text-[#051a50]">{t("noteOptional")}</h2>
          <ol className="mt-4 list-decimal space-y-1 rounded-md bg-[#fff0f1] py-2 pl-8 pr-3 text-sm leading-5 text-[#770b23]">
            {notices.map((notice, index) => (
              <li key={`${index}-${notice}`}>{notice}</li>
            ))}
          </ol>
        </div>
      ) : null}
    </aside>
  );
}
