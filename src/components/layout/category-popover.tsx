"use client";

import { ArrowRight2, Box, HamburgerMenu } from "iconsax-reactjs";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { resolveProductMediaUrl } from "@/features/products/utils/product-display";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/class-names";

export type HeaderCategory = {
  id: string;
  name: string;
  slug: string;
  productCount?: number;
  media?: readonly { url: string; isPrimary: boolean }[];
  children: readonly HeaderCategory[];
};

type CategoryPopoverProps = {
  categories: readonly HeaderCategory[];
  compact?: boolean;
  isLoading?: boolean;
  hasError?: boolean;
};

const HOVER_OPEN_DELAY_MS = 200;
const HOVER_CLOSE_DELAY_MS = 350;

type CategoryColumnProps = {
  categories: readonly HeaderCategory[];
  depth: number;
  activeCategoryId?: string;
  onActivate: (category: HeaderCategory, depth: number) => void;
  onExpand: (category: HeaderCategory, depth: number) => void;
};

function getPrimaryThumbnailUrl(category: HeaderCategory): string | null {
  const primaryMedia = category.media?.find((media) => media.isPrimary);
  return primaryMedia ? resolveProductMediaUrl(primaryMedia.url) : null;
}

function CategoryColumn({ categories, depth, activeCategoryId, onActivate, onExpand }: CategoryColumnProps) {
  const t = useTranslations("Header");

  return (
    <ul className="space-y-1 p-2">
      {categories.map((category) => {
        const hasChildren = category.children.length > 0;
        const isActive = activeCategoryId === category.id;
        const thumbnailUrl = depth === 0 ? getPrimaryThumbnailUrl(category) : null;

        return (
          <li
            key={category.id}
            className={cn(
              "flex min-h-11 items-stretch rounded-lg transition-colors",
              isActive ? "bg-[#eef5fc]" : "hover:bg-[#f5f7f8]",
            )}
            onMouseEnter={() => onActivate(category, depth)}
          >
            <Link
              href={`/products/category/${encodeURIComponent(category.slug)}`}
              onFocus={() => onActivate(category, depth)}
              className="flex min-w-0 flex-1 items-center gap-2 rounded-l-lg px-3 py-2 font-medium text-[#051a50] outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#2f7ac6]"
            >
              {thumbnailUrl ? (
                <span className="relative size-8 shrink-0 overflow-hidden rounded bg-white ring-1 ring-inset ring-[#eef0f3]">
                  <Image src={thumbnailUrl} alt="" fill unoptimized sizes="32px" className="object-contain p-0.5" />
                </span>
              ) : depth === 0 ? (
                <Box className="size-5 shrink-0 text-[#2f7ac6]" aria-hidden="true" />
              ) : (
                <span className="size-1.5 shrink-0 rounded-full bg-[#a3abbd]" aria-hidden="true" />
              )}
              <span className="min-w-0 flex-1 text-left">
                <span className="block leading-5">{category.name}</span>
                {category.productCount !== undefined ? (
                  <span className="block text-[11px] font-normal text-[#868da5]">
                    {t("categoryProductCount", { count: category.productCount })}
                  </span>
                ) : null}
              </span>
            </Link>
            {hasChildren ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={t("openSubcategories", { category: category.name })}
                aria-expanded={isActive}
                onClick={() => onExpand(category, depth)}
                className="h-auto min-h-11 w-10 shrink-0 rounded-l-none rounded-r-lg px-0 text-[#667085] hover:bg-[#e5eef8] hover:text-[#164990] focus-visible:ring-inset"
              >
                <ArrowRight2 className="size-4" aria-hidden="true" />
              </Button>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function getCategoryColumns(categories: readonly HeaderCategory[], activePath: readonly string[]) {
  const columns: Array<{ key: string; label: string | null; categories: readonly HeaderCategory[] }> = [
    { key: "root", label: null, categories },
  ];
  let currentCategories = categories;

  for (const categoryId of activePath) {
    const activeCategory = currentCategories.find((category) => category.id === categoryId);
    if (!activeCategory || activeCategory.children.length === 0) break;

    columns.push({
      key: `children-${columns.length}-${activeCategory.id}`,
      label: activeCategory.name,
      categories: activeCategory.children,
    });
    currentCategories = activeCategory.children;
  }

  return columns;
}

export function CategoryPopover({
  categories,
  compact = false,
  isLoading = false,
  hasError = false,
}: CategoryPopoverProps) {
  const t = useTranslations("Header");
  const [open, setOpen] = useState(false);
  const [activePath, setActivePath] = useState<string[]>([]);
  const hoverTimerRef = useRef<number | null>(null);
  const columns = getCategoryColumns(categories, activePath);

  useEffect(
    () => () => {
      if (hoverTimerRef.current !== null) window.clearTimeout(hoverTimerRef.current);
    },
    [],
  );

  function clearHoverTimer(): void {
    if (hoverTimerRef.current === null) return;
    window.clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = null;
  }

  function activateCategory(category: HeaderCategory, depth: number): void {
    setActivePath((currentPath) => {
      const nextPath = currentPath.slice(0, depth);
      if (category.children.length > 0) nextPath.push(category.id);
      return nextPath;
    });
  }

  function expandCategory(category: HeaderCategory, depth: number): void {
    setActivePath((currentPath) => [...currentPath.slice(0, depth), category.id]);
  }

  function changeOpen(nextOpen: boolean): void {
    clearHoverTimer();
    setOpen(nextOpen);
    if (!nextOpen) setActivePath([]);
  }

  function scheduleOpen(): void {
    clearHoverTimer();
    if (open) return;
    hoverTimerRef.current = window.setTimeout(() => changeOpen(true), HOVER_OPEN_DELAY_MS);
  }

  function scheduleClose(): void {
    clearHoverTimer();
    hoverTimerRef.current = window.setTimeout(() => changeOpen(false), HOVER_CLOSE_DELAY_MS);
  }

  return (
    <Popover open={open} onOpenChange={changeOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="brand"
          aria-label={compact ? t("openCategories") : undefined}
          onMouseEnter={scheduleOpen}
          onMouseLeave={scheduleClose}
          className={cn(
            "h-11 shrink-0 gap-2 shadow-none",
            compact ? "size-10 rounded-full p-0" : "rounded-l-full rounded-r-none px-4",
          )}
        >
          <HamburgerMenu size={16} aria-hidden="true" />
          {compact ? null : <span>{t("allCategories")}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align={compact ? "end" : "start"}
        sideOffset={8}
        onMouseEnter={clearHoverTimer}
        onMouseLeave={scheduleClose}
        className="w-auto max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-[#d5d7da] bg-white p-0 text-[#101828] shadow-[0_12px_32px_rgba(5,26,80,0.16)]"
      >
        <nav aria-label={t("productCategories")}>
          {isLoading ? (
            <p role="status" className="w-[280px] px-5 py-6 text-sm text-[#73798f]">
              {t("loadingCategories")}
            </p>
          ) : categories.length > 0 ? (
            <div className="flex max-w-[calc(100vw-2rem)] items-stretch overflow-x-auto">
              {columns.map((column, depth) => (
                <section
                  key={column.key}
                  aria-label={column.label ? t("subcategoriesOf", { category: column.label }) : t("shopByCategories")}
                  className="max-h-[min(70vh,560px)] w-[280px] shrink-0 overflow-y-auto border-l border-[#e5e9ef] first:border-l-0"
                >
                  <p className="sticky top-0 z-10 border-b border-[#eef0f3] bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[#868da5]">
                    {column.label ?? t("shopByCategories")}
                  </p>
                  <CategoryColumn
                    categories={column.categories}
                    depth={depth}
                    activeCategoryId={activePath[depth]}
                    onActivate={activateCategory}
                    onExpand={expandCategory}
                  />
                </section>
              ))}
            </div>
          ) : (
            <p className="w-[280px] px-5 py-6 text-sm text-[#73798f]">
              {hasError ? t("categoriesUnavailable") : t("noCategories")}
            </p>
          )}
        </nav>
      </PopoverContent>
    </Popover>
  );
}
