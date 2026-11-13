"use client";

import { ArrowRight, ShoppingCart, Verify } from "iconsax-reactjs";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAuthSessionQuery } from "@/features/auth";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/class-names";
import { getApiErrorMessage } from "@/lib/api-error";

import type { Product } from "../products.types";
import { useAddProductToCartMutation } from "../api/use-add-product-to-cart-mutation";
import { getProductCardPresentation } from "../utils/product-display";

type ProductCardProps = {
  product: Product;
  appearance?: "default" | "outstanding" | "catalog";
};

export function ProductCard({ product, appearance = "default" }: ProductCardProps) {
  const t = useTranslations("ProductCard");
  const tErrors = useTranslations("ApiErrors");
  const addCartItem = useAddProductToCartMutation();
  const sessionQuery = useAuthSessionQuery();
  const presentation = getProductCardPresentation(product);
  const productHref = `/products/${product.slug}`;
  const showLoginToViewPrice = !presentation.priceVisible && sessionQuery.data?.authenticated === false;

  function handleAddToCart() {
    if (addCartItem.isPending || !presentation.canPurchase) return;
    addCartItem.mutate(product.slug, {
      onSuccess: () => toast.success(t("added", { name: product.name })),
      onError: (error) => toast.error(t("error"), { description: getApiErrorMessage(error, tErrors) }),
    });
  }

  return (
    <article
      className={cn(
        "group relative isolate flex min-w-0 flex-col overflow-hidden rounded-[8px] bg-[#f5f7f8] p-1 transition-shadow duration-300",
        appearance === "catalog" && "bg-white",
        "before:absolute before:inset-0 before:z-0 before:bg-gradient-to-t before:from-white before:via-white before:via-[25%] before:to-[#efa33b] before:opacity-0 before:transition-opacity before:duration-300 before:content-['']",
        "hover:shadow-[0_12px_30px_rgba(239,163,59,0.2)] hover:before:opacity-100",
        "focus-within:shadow-[0_12px_30px_rgba(239,163,59,0.2)] focus-within:before:opacity-100",
      )}
    >
      <Link
        href={productHref}
        className={cn(
          "relative z-10 block aspect-square overflow-hidden border border-[#ecf0f3] bg-white transition-[border-color] duration-300",
          appearance === "catalog" ? "rounded-[4px]" : "rounded-[8px]",
          "group-hover:border-2 group-hover:border-[#fcdb97] group-focus-within:border-2 group-focus-within:border-[#fcdb97]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#164990]",
          appearance === "outstanding" && "border-2 border-[#fcdb97]",
        )}
      >
        <Image
          src={presentation.image}
          alt={product.name}
          fill
          sizes="(min-width: 1280px) 190px, (min-width: 768px) 30vw, 45vw"
          className="object-contain p-3"
        />
        {presentation.badge ? (
          <span
            className={cn(
              "absolute left-0 top-0 inline-flex items-center gap-0.5 rounded-br px-2 py-1.5 text-xs font-medium leading-none text-white",
              presentation.outOfStock ? "bg-[#c9ced8]" : "bg-[#e57a00]",
            )}
          >
            {!presentation.outOfStock && presentation.badge === "Best Seller" ? (
              <Image src="/home/icon/fire.svg" alt="Best Seller" width={12} height={12} />
            ) : null}
            {presentation.outOfStock
              ? t("outOfStock")
              : presentation.badge === "Best Seller"
                ? t("bestSeller")
                : presentation.badge}
          </span>
        ) : null}
        {presentation.discount ? (
          <span className="absolute right-0 top-0 rounded-bl bg-[linear-gradient(270deg,#e16555_0%,#ce2823_100%)] px-1.5 py-0.5 text-xs font-medium text-white shadow-[0_0_50px_0_rgba(239,163,59,0.30)]">
            {presentation.discount}
          </span>
        ) : null}
      </Link>

      <div className="relative z-10 flex flex-1 flex-col gap-2 px-2 pb-2 pt-3">
        <div className="min-h-[58px]">
          {product.productNo ? <p className="text-xs leading-4 text-[#73798f]">{product.productNo}</p> : null}
          <Link
            href={productHref}
            className="line-clamp-2 text-sm font-semibold leading-[17px] text-[#051a50] hover:text-[#164990] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#164990]"
          >
            {product.name}
          </Link>
        </div>

        {product.brandName ? (
          <div className="flex items-center gap-1 overflow-hidden text-xs text-[#5e6375]">
            <span
              className="inline-flex min-w-0 items-center gap-1 rounded-full border border-[#ecf0f3] px-1.5 py-0.5"
              title={product.brandName}
            >
              <Verify className="size-3 shrink-0 text-[#3eb584]" variant="Bold" aria-hidden="true" />
              <span className="truncate">{product.brandName}</span>
            </span>
          </div>
        ) : null}

        <p className="flex min-h-5 items-center gap-1.5 text-base font-bold text-[#e57a00]">
          {showLoginToViewPrice ? (
            <Link
              href="/login"
              className="hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#164990]"
            >
              {t("loginToViewPrice")}
            </Link>
          ) : (
            <>
              {presentation.price}
              {presentation.originalPrice ? (
                <span className="text-base font-normal text-[#a3abbd] line-through">{presentation.originalPrice}</span>
              ) : null}
            </>
          )}
        </p>

        <div className="flex gap-2">
          <Button
            asChild
            size="sm"
            variant={presentation.canPurchase ? "brand" : "outline"}
            className={cn(
              "h-8 flex-1 rounded-full px-2 text-xs shadow-none",
              !presentation.canPurchase &&
              "border-[#2f7bc4] bg-white text-[#164990] hover:bg-[#f3f8fc] hover:text-[#164990]",
            )}
          >
            <Link
              href={productHref}
              aria-label={`${presentation.canPurchase ? t("buyNow") : t("learnMore")}: ${product.name}`}
            >
              {presentation.canPurchase ? t("buyNow") : t("learnMore")}
              <span className="sr-only">: {product.name}</span>
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </Button>
          {presentation.canPurchase ? (
            <Button
              type="button"
              size="icon"
              aria-label={t("addToCart", { name: product.name })}
              aria-busy={addCartItem.isPending}
              disabled={addCartItem.isPending}
              onClick={handleAddToCart}
              className="size-8 shrink-0 rounded-full bg-gradient-to-r from-[#164990] to-[#2f7bc4] shadow-none hover:brightness-110"
            >
              <ShoppingCart className="size-3.5" variant="Bold" aria-hidden="true" />
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
