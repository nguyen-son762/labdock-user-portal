import { Gallery } from "iconsax-reactjs";
import { useTranslations } from "next-intl";

import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import type { RfqDetail, RfqItem } from "../schemas/rfq.schema";
import { formatRfqCurrency, formatRfqDate } from "../utils/rfq-formatters";

const EMPTY_VALUE = "-";

/** Quoted line total once a supplier has priced the item, otherwise the estimate from the listed price. */
function getItemSubtotal(item: RfqItem) {
  return item.quoteUnitPrice === null ? item.estimatedValue : item.quoteUnitPrice * item.quantity;
}

function formatAmount(value: number | null, currency: string | null) {
  return value === null ? EMPTY_VALUE : formatRfqCurrency(value, currency);
}

function ProductIdentity({ item }: { item: RfqItem }) {
  const t = useTranslations("Rfqs");
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex size-[52px] shrink-0 items-center justify-center overflow-hidden rounded bg-[#f5f7f8]">
        <Gallery className="size-5 text-[#a3abbd]" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <strong className="line-clamp-2 block text-base font-medium text-[#051a50]">
          {item.productName ?? t("unnamedProduct")}
        </strong>
        {item.sku ? (
          <span className="block text-sm text-[#73798f]">{t("categoryNumber", { number: item.sku })}</span>
        ) : null}
      </span>
    </div>
  );
}

export function RfqItemsCard({ rfq }: { rfq: RfqDetail }) {
  const t = useTranslations("Rfqs");
  const lineSubtotals = rfq.items.map(getItemSubtotal);
  const subtotal = lineSubtotals.every((value) => value !== null)
    ? lineSubtotals.reduce<number>((sum, value) => sum + (value ?? 0), 0)
    : null;
  const total = rfq.quotedTotal ?? rfq.estimatedValue;

  return (
    <Card className="overflow-hidden border-[#dde2e8] !shadow-none">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-dashed border-[#dde2e8] px-5 py-4">
        <h2 className="text-xl font-semibold text-[#1f5fa8]">{t("rfqNumberLabel", { number: rfq.rfqNumber })}</h2>
        <span className="text-lg text-[#73798f]">
          {t("dateSubmittedLabel", { date: formatRfqDate(rfq.createdAt) })}
        </span>
      </div>
      <div className="p-5">
        {rfq.items.length ? (
          <>
            <div className="hidden md:block">
              <Table className="border-b border-[#dde2e8] text-base text-[#051a50]">
                <TableHeader className="bg-[#ecf0f3] [&_th]:h-[56px] [&_th]:border-r [&_th]:border-white [&_th]:px-8 [&_th]:text-[13px] [&_th]:font-medium [&_th]:text-[#051a50] [&_th:last-child]:border-0">
                  <TableRow className="hover:bg-[#ecf0f3]">
                    <TableHead className="w-[36%]">{t("product")}</TableHead>
                    <TableHead className="w-[12.8%]">{t("unitPrice")}</TableHead>
                    <TableHead className="w-[12.8%]">{t("size")}</TableHead>
                    <TableHead className="w-[12.8%]">{t("requestedQty")}</TableHead>
                    <TableHead className="w-[12.8%]">{t("quotedUnitPrice")}</TableHead>
                    <TableHead className="w-[12.8%]">{t("subtotal")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="[&_td]:px-8 [&_td]:py-2">
                  {rfq.items.map((item, index) => (
                    <TableRow key={item.id} className="h-[74px] border-[#dde2e8] hover:bg-transparent">
                      <TableCell>
                        <ProductIdentity item={item} />
                      </TableCell>
                      <TableCell>{formatAmount(item.listedUnitPrice, rfq.currency)}</TableCell>
                      <TableCell>{item.variantName ?? EMPTY_VALUE}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{formatAmount(item.quoteUnitPrice, rfq.currency)}</TableCell>
                      <TableCell>{formatAmount(lineSubtotals[index] ?? null, rfq.currency)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="divide-y divide-[#dde2e8] md:hidden">
              {rfq.items.map((item, index) => (
                <article key={item.id} className="space-y-3 py-4 first:pt-0">
                  <ProductIdentity item={item} />
                  <dl className="grid grid-cols-2 gap-2 text-sm text-[#051a50]">
                    <div>
                      <dt className="text-xs text-[#73798f]">{t("unitPrice")}</dt>
                      <dd>{formatAmount(item.listedUnitPrice, rfq.currency)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[#73798f]">{t("size")}</dt>
                      <dd>{item.variantName ?? EMPTY_VALUE}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[#73798f]">{t("requestedQty")}</dt>
                      <dd>{item.quantity}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[#73798f]">{t("quotedUnitPrice")}</dt>
                      <dd>{formatAmount(item.quoteUnitPrice, rfq.currency)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[#73798f]">{t("subtotal")}</dt>
                      <dd>{formatAmount(lineSubtotals[index] ?? null, rfq.currency)}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          </>
        ) : (
          <p className="py-8 text-center text-sm text-[#73798f]">{t("noItems")}</p>
        )}

        <dl className="mt-5 space-y-2 rounded-xl bg-[#f5f7f8] p-5 text-lg text-[#73798f]">
          <div className="flex justify-between gap-3">
            <dt>{t("subtotal")}</dt>
            <dd className="font-medium text-[#051a50]">{formatAmount(subtotal, rfq.currency)}</dd>
          </div>
          <div className="flex justify-between gap-3 border-t border-[#dde2e8] pt-4 text-[28px] leading-9 text-[#051a50]">
            <dt className="font-medium">{t("grandTotal")}</dt>
            <dd className="font-semibold text-[#1f5fa8]">{formatAmount(total, rfq.currency)}</dd>
          </div>
        </dl>
      </div>
    </Card>
  );
}
