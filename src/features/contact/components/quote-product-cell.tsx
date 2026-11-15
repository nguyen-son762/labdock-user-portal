"use client";

import { CloseCircle, TickCircle } from "iconsax-reactjs";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandItem, CommandList } from "@/components/ui/command";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { MIN_PRODUCT_SEARCH_LENGTH, useProductSearchQuery } from "../api/use-product-search-query";
import { useQuoteProductVariantsQuery } from "../api/use-quote-product-variants-query";
import type { ContactFormValues } from "../schemas/contact.schema";
import type { ProductSearchItem } from "../schemas/product-search.schema";

const SEARCH_DEBOUNCE_MS = 300;
const NO_VARIANTS: never[] = [];

function useDebouncedValue(value: string) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = globalThis.setTimeout(() => setDebounced(value), SEARCH_DEBOUNCE_MS);
    return () => globalThis.clearTimeout(timer);
  }, [value]);
  return debounced;
}

export function QuoteProductCell({ index }: { index: number }) {
  const t = useTranslations("Contact");
  const form = useFormContext<ContactFormValues>();
  const [open, setOpen] = useState(false);
  const name = form.watch(`products.${index}.productName`);
  const productId = form.watch(`products.${index}.productId`);
  const slug = form.watch(`products.${index}.slug`);
  const variantId = form.watch(`products.${index}.variantId`);
  const term = useDebouncedValue(name);
  // Only search while the user is typing; a picked product keeps its name without re-querying.
  const searchQuery = useProductSearchQuery(productId ? "" : term);
  const variantsQuery = useQuoteProductVariantsQuery(slug);
  const variants = variantsQuery.data ?? NO_VARIANTS;
  const results = searchQuery.data?.items ?? [];
  const canSearch = !productId && name.trim().length >= MIN_PRODUCT_SEARCH_LENGTH;

  // A product with a single purchasable variant needs no size choice.
  useEffect(() => {
    if (variantsQuery.isSuccess && variants.length === 1 && !variantId && variants[0]) {
      form.setValue(`products.${index}.variantId`, variants[0].id, { shouldValidate: true });
    }
  }, [form, index, variantId, variants, variantsQuery.isSuccess]);

  const pick = (item: ProductSearchItem) => {
    const options = { shouldDirty: true } as const;
    form.setValue(`products.${index}.productName`, item.name, options);
    form.setValue(`products.${index}.productId`, item.id, options);
    form.setValue(`products.${index}.slug`, item.slug, options);
    form.setValue(`products.${index}.brand`, item.brandName, options);
    form.setValue(`products.${index}.variantId`, "", options);
    form.clearErrors(`products.${index}`);
    setOpen(false);
  };
  const clear = () => {
    for (const field of ["productName", "productId", "slug", "brand", "variantId"] as const) {
      form.setValue(`products.${index}.${field}`, "", { shouldDirty: true });
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-start gap-1.5">
        <FormField
          control={form.control}
          name={`products.${index}.productName`}
          render={({ field }) => (
            <FormItem className="min-w-0 flex-1">
              <Popover open={open && canSearch} onOpenChange={setOpen}>
                <PopoverAnchor asChild>
                  <FormControl>
                    <Input
                      aria-label={`${t("productName")} ${index + 1}`}
                      placeholder={t("productPlaceholder")}
                      autoComplete="off"
                      className="h-[30px] border-[#7aa7e4] bg-white px-2 text-xs"
                      {...field}
                      onChange={(event) => {
                        field.onChange(event);
                        // Editing the text invalidates the previously picked product.
                        for (const key of ["productId", "slug", "brand", "variantId"] as const) {
                          form.setValue(`products.${index}.${key}`, "");
                        }
                        setOpen(true);
                      }}
                      onFocus={() => setOpen(true)}
                      onClick={() => setOpen(true)}
                    />
                  </FormControl>
                </PopoverAnchor>
                <PopoverContent
                  align="start"
                  className="w-[var(--radix-popover-trigger-width)] min-w-72 p-0"
                  onOpenAutoFocus={(event) => event.preventDefault()}
                >
                  <Command shouldFilter={false}>
                    <CommandList>
                      {searchQuery.isFetching ? (
                        <p role="status" className="px-3 py-2 text-xs text-muted-foreground">
                          {t("searching")}
                        </p>
                      ) : null}
                      {searchQuery.isError ? (
                        <p role="alert" className="px-3 py-2 text-xs text-destructive">
                          {t("searchError")}
                        </p>
                      ) : null}
                      {searchQuery.isSuccess && results.length === 0 ? (
                        <CommandEmpty className="py-3 text-xs">{t("noProducts")}</CommandEmpty>
                      ) : null}
                      {results.map((item) => (
                        <CommandItem
                          key={item.id}
                          value={item.id}
                          onSelect={() => pick(item)}
                          className="flex flex-col items-start gap-0 text-xs"
                        >
                          <span className="font-medium text-[#051a50]">{item.name}</span>
                          <span className="text-muted-foreground">
                            {[item.productNo, item.brandName].filter(Boolean).join(" · ")}
                          </span>
                        </CommandItem>
                      ))}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage className="text-[10px]" />
            </FormItem>
          )}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t("confirmProduct", { index: index + 1 })}
          className="size-[30px] text-[#12b76a] hover:bg-[#ecfdf3] hover:text-[#12b76a]"
          onClick={() => void form.trigger(`products.${index}`)}
        >
          <TickCircle className="size-4" aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t("clearProduct", { index: index + 1 })}
          className="size-[30px] text-[#f04438] hover:bg-[#fef3f2] hover:text-[#f04438]"
          onClick={clear}
        >
          <CloseCircle className="size-4" aria-hidden="true" />
        </Button>
      </div>
      {productId && variantsQuery.isError ? (
        <p role="alert" className="text-[10px] text-destructive">
          {t("variantsError")}
        </p>
      ) : null}
      {productId && variantsQuery.isSuccess && variants.length === 0 ? (
        <p role="alert" className="text-[10px] text-destructive">
          {t("noVariants")}
        </p>
      ) : null}
      {variants.length > 1 ? (
        <FormField
          control={form.control}
          name={`products.${index}.variantId`}
          render={({ field }) => (
            <FormItem>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger
                    aria-label={t("sizeForProduct", { index: index + 1 })}
                    className="h-[30px] bg-white px-2 text-xs"
                  >
                    <SelectValue placeholder={t("selectSize")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white">
                  {variants.map((variant) => (
                    <SelectItem key={variant.id} value={variant.id}>
                      {variant.selections.map((item) => `${item.attributeName}: ${item.value}`).join(", ") ||
                        variant.sku}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage className="text-[10px]" />
            </FormItem>
          )}
        />
      ) : null}
    </div>
  );
}
