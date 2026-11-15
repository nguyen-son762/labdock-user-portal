"use client";

import { Add, Trash } from "iconsax-reactjs";
import { useFieldArray, useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import type { ContactFormValues } from "../schemas/contact.schema";
import { QuoteProductCell } from "./quote-product-cell";

const emptyProduct = {
  productName: "",
  productId: "",
  slug: "",
  variantId: "",
  brand: "",
  quantity: "",
  budgetRange: "",
};

export function QuoteProductsTable() {
  const t = useTranslations("Contact");
  const form = useFormContext<ContactFormValues>();
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "products" });

  return (
    <section aria-labelledby="products-of-interest-title">
      <h3 id="products-of-interest-title" className="mb-4 text-base font-semibold text-[#1f5fa8]">
        {t("productsTitle")}
      </h3>
      <div className="overflow-hidden rounded-xl border border-[#d5dce5] bg-white">
        <Table className="min-w-[900px] table-fixed">
          <TableHeader className="bg-[#f5f7f8]">
            <TableRow className="hover:bg-[#f5f7f8]">
              <TableHead className="w-[38%] px-3">{t("productName")}</TableHead>
              <TableHead className="w-[19%] px-3">{t("brand")}</TableHead>
              <TableHead className="w-[19%] px-3">{t("quantity")}</TableHead>
              <TableHead className="w-[19%] px-3">{t("budgetRange")}</TableHead>
              <TableHead className="w-[5%] px-3">
                <span className="sr-only">{t("actions")}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((product, index) => (
              <TableRow key={product.id} className="hover:bg-white">
                <TableCell className="p-2 align-top">
                  <QuoteProductCell index={index} />
                </TableCell>
                <TableCell className="p-2 align-top">
                  <p
                    aria-label={t("brandForProduct", { index: index + 1 })}
                    className="flex h-[30px] items-center truncate px-1 text-xs text-[#051a50]"
                  >
                    {form.watch(`products.${index}.brand`) || "–"}
                  </p>
                </TableCell>
                <TableCell className="p-2 align-top">
                  <FormField
                    control={form.control}
                    name={`products.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <NumberInput
                            aria-label={`${t("quantity")} ${index + 1}`}
                            value={field.value}
                            valueIsNumericString
                            decimalScale={0}
                            allowNegative={false}
                            allowLeadingZeros={false}
                            inputMode="numeric"
                            placeholder={t("quantityPlaceholder")}
                            className="h-[30px] border-[#7aa7e4] bg-white px-2 text-xs"
                            onValueChange={({ value }) => field.onChange(value)}
                          />
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                </TableCell>
                <TableCell className="p-2 align-top">
                  <FormField
                    control={form.control}
                    name={`products.${index}.budgetRange`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            aria-label={`${t("budgetRange")} ${index + 1}`}
                            placeholder={t("budgetPlaceholder")}
                            className="h-[30px] border-[#7aa7e4] bg-white px-2 text-xs"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                </TableCell>
                <TableCell className="p-2 align-top">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={t("removeProduct", { index: index + 1 })}
                    onClick={() => remove(index)}
                    className="size-[30px] text-[#d92d20] hover:bg-[#fef3f2] hover:text-[#d92d20]"
                  >
                    <Trash className="size-4" aria-hidden="true" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="border-t border-[#e5e9ef] px-3 py-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={fields.length >= 5}
            onClick={() => append(emptyProduct)}
            className="h-7 px-0 text-xs font-normal text-[#164990] hover:bg-transparent hover:text-[#164990]"
          >
            <Add className="size-4" aria-hidden="true" /> {t("addProduct")}
          </Button>
        </div>
      </div>
      {form.formState.errors.products?.root?.message ? (
        <p role="alert" className="mt-1 text-xs text-destructive">
          {form.formState.errors.products.root.message}
        </p>
      ) : null}
    </section>
  );
}
