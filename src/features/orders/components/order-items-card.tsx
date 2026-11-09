import { Gallery } from "iconsax-reactjs";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import type { OrderDetail } from "../schemas/order.schema";
import { formatCurrency } from "../utils/order-formatters";
import { orderDetailPlaceholders } from "../data/order-detail-placeholders";

function ProductIdentity({ item, index }: { item: OrderDetail["invoice"]["lines"][number]; index: number }) {
  const t = useTranslations("Orders");
  const preview = orderDetailPlaceholders.products[index];
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded bg-[#f5f7f8]">
        {preview ? (
          <Image src={preview.image} alt="" width={40} height={40} className="size-10 object-contain" />
        ) : (
          <Gallery className="size-5 text-[#a3abbd]" aria-hidden="true" />
        )}
      </span>
      <span className="min-w-0">
        <strong className="line-clamp-2 block text-sm font-medium text-[#051a50]">{item.productName}</strong>
        <span className="block text-xs text-[#73798f]">{t("categoryNumber", { number: item.sku })}</span>
      </span>
    </div>
  );
}

export function OrderItemsCard({ order }: { order: OrderDetail }) {
  const t = useTranslations("Orders");
  return (
    <Card className="overflow-hidden border-[#dde2e8] !shadow-none">
      <h2 className="border-b border-[#dde2e8] px-4 py-3 text-lg font-semibold leading-6 text-[#1f5fa8]">
        {t("itemsOrdered")}
      </h2>
      <div className="p-4">
        {order.invoice.lines.length ? (
          <>
            <div className="hidden md:block">
              <Table className="border-b border-[#dde2e8] text-sm text-[#051a50]">
                <TableHeader className="bg-[#ecf0f3] [&_th]:border-r [&_th]:border-white [&_th]:px-6 [&_th:last-child]:border-0">
                  <TableRow className="hover:bg-[#ecf0f3]">
                    <TableHead className="w-[36%]">{t("product")}</TableHead>
                    <TableHead className="w-[16%]">{t("unitPrice")}</TableHead>
                    <TableHead className="w-[16%]">{t("size")}</TableHead>
                    <TableHead className="w-[16%]">{t("quantity")}</TableHead>
                    <TableHead className="w-[16%]">{t("subtotal")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.invoice.lines.map((item, index) => (
                    <TableRow key={`${item.sku}-${index}`}>
                      <TableCell className="px-6 py-2">
                        <ProductIdentity item={item} index={index} />
                      </TableCell>
                      <TableCell className="px-6 py-2">{formatCurrency(item.unitPrice, order.currency)}</TableCell>
                      <TableCell className="px-6 py-2">
                        {orderDetailPlaceholders.products[index]?.size ?? "—"}
                      </TableCell>
                      <TableCell className="px-6 py-2">{item.quantity}</TableCell>
                      <TableCell className="px-6 py-2">{formatCurrency(item.lineTotal, order.currency)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="divide-y divide-[#dde2e8] md:hidden">
              {order.invoice.lines.map((item, index) => (
                <article key={`${item.sku}-${index}`} className="space-y-3 py-4">
                  <ProductIdentity item={item} index={index} />
                  <dl className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <dt className="text-xs text-[#73798f]">{t("size")}</dt>
                      <dd>{orderDetailPlaceholders.products[index]?.size ?? "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[#73798f]">{t("unitPrice")}</dt>
                      <dd>{formatCurrency(item.unitPrice, order.currency)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[#73798f]">{t("quantity")}</dt>
                      <dd>{item.quantity}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[#73798f]">{t("lineTotal")}</dt>
                      <dd>{formatCurrency(item.lineTotal, order.currency)}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          </>
        ) : (
          <p className="py-8 text-center text-sm text-[#73798f]">{t("noInvoiceLines")}</p>
        )}

        <dl className="mt-4 space-y-2 rounded-xl bg-[#f5f7f8] p-4 text-base text-[#73798f]">
          <Amount label={t("subtotal")} value={order.subtotal} currency={order.currency} />
          <div className="flex justify-between gap-3">
            <dt>{t("deliveryFee")}</dt>
            <dd className="font-medium text-[#051a50]">
              {order.shippingFee === 0 ? t("free") : formatCurrency(order.shippingFee, order.currency)}
            </dd>
          </div>
          {order.additionalFeeTotal > 0 ? (
            <Amount label={t("additionalFees")} value={order.additionalFeeTotal} currency={order.currency} />
          ) : null}
          {order.platformFee > 0 ? (
            <Amount label={t("platformFee")} value={order.platformFee} currency={order.currency} />
          ) : null}
          <Amount label={t("tax")} value={order.tax} currency={order.currency} />
          <div className="flex justify-between border-t border-[#dde2e8] pt-3 text-2xl text-[#051a50]">
            <dt className="font-medium">{t("total")}</dt>
            <dd className="font-semibold text-[#1f5fa8]">{formatCurrency(order.total, order.currency)}</dd>
          </div>
        </dl>
      </div>
    </Card>
  );
}

function Amount({ label, value, currency }: { label: string; value: number; currency: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt>{label}</dt>
      <dd className="font-medium text-[#051a50]">{formatCurrency(value, currency)}</dd>
    </div>
  );
}
