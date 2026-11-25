"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ArrowLeft2, ArrowRight2, Box, CloseCircle, HamburgerMenu } from "iconsax-reactjs";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { resolveProductMediaUrl } from "@/features/products/utils/product-display";
import { Link } from "@/i18n/navigation";

import type { HeaderCategory } from "./category-popover";

type CategorySidebarProps = {
  categories: readonly HeaderCategory[];
  isLoading?: boolean;
  hasError?: boolean;
};

function getThumbnailUrl(category: HeaderCategory): string | null {
  const primaryMedia = category.media?.find((media) => media.isPrimary);
  return primaryMedia ? resolveProductMediaUrl(primaryMedia.url) : null;
}

function getCategoryHref(category: HeaderCategory): string {
  return `/products/category/${encodeURIComponent(category.slug)}`;
}

/** Resolves the drill-down path (category ids) to the categories along it, dropping stale ids. */
function resolveTrail(categories: readonly HeaderCategory[], path: readonly string[]): HeaderCategory[] {
  const trail: HeaderCategory[] = [];
  let level = categories;
  for (const id of path) {
    const category = level.find((item) => item.id === id);
    if (!category || category.children.length === 0) break;
    trail.push(category);
    level = category.children;
  }
  return trail;
}

/** Mobile and tablet category navigation: a left drawer that drills down one level at a time. */
export function CategorySidebar({ categories, isLoading = false, hasError = false }: CategorySidebarProps) {
  const t = useTranslations("Header");
  const [open, setOpen] = useState(false);
  const [path, setPath] = useState<string[]>([]);
  const trail = resolveTrail(categories, path);
  const current = trail.at(-1);
  const parent = trail.at(-2);
  const visibleCategories = current?.children ?? categories;

  function changeOpen(nextOpen: boolean): void {
    setOpen(nextOpen);
    if (!nextOpen) setPath([]);
  }

  const close = () => changeOpen(false);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={changeOpen}>
      <DialogPrimitive.Trigger asChild>
        <Button
          type="button"
          variant="brand"
          aria-label={t("openCategories")}
          className="size-10 shrink-0 rounded-full p-0 shadow-none"
        >
          <HamburgerMenu size={16} aria-hidden="true" />
        </Button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[#051a50]/40 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 left-0 z-[51] flex h-dvh w-[min(360px,88vw)] flex-col bg-white text-[#051a50] shadow-[8px_0_32px_rgba(5,26,80,0.18)] duration-300 focus:outline-none data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:animate-in data-[state=open]:slide-in-from-left"
        >
          <div className="flex min-h-16 items-center gap-2 bg-gradient-to-r from-[#164990] to-[#2f7ac6] px-3 text-white">
            {current ? (
              <button
                type="button"
                onClick={() => setPath((currentPath) => currentPath.slice(0, -1))}
                aria-label={t("backTo", { category: parent?.name ?? t("shopByCategories") })}
                className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <ArrowLeft2 className="size-5" aria-hidden="true" />
              </button>
            ) : (
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/15">
                <HamburgerMenu size={18} aria-hidden="true" />
              </span>
            )}
            <DialogPrimitive.Title className="min-w-0 flex-1 truncate text-base font-semibold">
              {current?.name ?? t("shopByCategories")}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              aria-label={t("closeCategories")}
              className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <CloseCircle className="size-6" aria-hidden="true" />
            </DialogPrimitive.Close>
          </div>

          <nav aria-label={t("productCategories")} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {isLoading ? (
              <p role="status" className="px-5 py-6 text-sm text-[#73798f]">
                {t("loadingCategories")}
              </p>
            ) : categories.length === 0 ? (
              <p className="px-5 py-6 text-sm text-[#73798f]">
                {hasError ? t("categoriesUnavailable") : t("noCategories")}
              </p>
            ) : (
              <>
                {current ? (
                  <Link
                    href={getCategoryHref(current)}
                    onClick={close}
                    className="flex items-center justify-between gap-3 border-b border-[#eef0f3] bg-[#f5f9fd] px-5 py-3.5 text-sm font-semibold text-[#164990] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#2f7ac6]"
                  >
                    <span className="min-w-0 truncate">{t("viewAllInCategory", { category: current.name })}</span>
                    <ArrowRight2 className="size-4 shrink-0" aria-hidden="true" />
                  </Link>
                ) : null}
                <ul className="divide-y divide-[#f0f2f5]">
                  {visibleCategories.map((category) => {
                    const hasChildren = category.children.length > 0;
                    const thumbnailUrl = current ? null : getThumbnailUrl(category);

                    return (
                      <li key={category.id} className="flex min-h-14 items-stretch">
                        <Link
                          href={getCategoryHref(category)}
                          onClick={close}
                          className="flex min-w-0 flex-1 items-center gap-3 px-5 py-3 active:bg-[#f5f7f8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#2f7ac6]"
                        >
                          {thumbnailUrl ? (
                            <span className="relative size-9 shrink-0 overflow-hidden rounded-md bg-white ring-1 ring-inset ring-[#eef0f3]">
                              <Image
                                src={thumbnailUrl}
                                alt=""
                                fill
                                unoptimized
                                sizes="36px"
                                className="object-contain p-0.5"
                              />
                            </span>
                          ) : current ? null : (
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-[#eef5fc]">
                              <Box className="size-5 text-[#2f7ac6]" aria-hidden="true" />
                            </span>
                          )}
                          <span className="min-w-0 flex-1">
                            <span className="block text-[15px] font-medium leading-5">{category.name}</span>
                            {category.productCount !== undefined ? (
                              <span className="mt-0.5 block text-xs text-[#868da5]">
                                {t("categoryProductCount", { count: category.productCount })}
                              </span>
                            ) : null}
                          </span>
                        </Link>
                        {hasChildren ? (
                          <button
                            type="button"
                            onClick={() => setPath([...trail.map(({ id }) => id), category.id])}
                            aria-label={t("openSubcategories", { category: category.name })}
                            className="flex w-14 shrink-0 items-center justify-center border-l border-[#f0f2f5] text-[#667085] active:bg-[#eef5fc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#2f7ac6]"
                          >
                            <ArrowRight2 className="size-5" aria-hidden="true" />
                          </button>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </nav>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
