import { ArrowRight } from "iconsax-reactjs";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import type { OrderSummary } from "../schemas/order.schema";
import { formatCurrency, formatOrderDate } from "../utils/order-formatters";
import { OrderStatusBadge } from "./order-status-badge";

const paginationButtonClassName =
  "h-[34px] rounded-full border-[#dde2e8] px-3.5 text-sm font-medium text-[#051a50] shadow-[0_1px_2px_rgba(10,13,18,0.05)] disabled:text-[#c8d0d9] disabled:opacity-100";

export function OrdersTable({
  orders,
  total,
  page,
  pageSize,
  onPageChange,
}: {
  orders: OrderSummary[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  const t = useTranslations("Orders");
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min((page - 1) * pageSize + orders.length, total);

  if (orders.length === 0) return null;

  return (
    <section className="overflow-hidden rounded-xl border border-[#dde2e8] bg-white" aria-label={t("tableLabel")}>
      <div className="hidden md:block">
        <Table>
          <TableHeader className="bg-[#ecf0f3]">
            <TableRow className="border-[#dde2e8] hover:bg-[#ecf0f3]">
              <TableHead>{t("orderNumber")}</TableHead>
              <TableHead>{t("orderDate")}</TableHead>
              <TableHead>{t("status")}</TableHead>
              <TableHead>{t("total")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} className="h-[50px] border-[#dde2e8] hover:bg-[#f9fcff]">
                <TableCell className="px-6 py-2">
                  <Link
                    href={`/orders/${order.id}`}
                    className="font-medium text-[#051a50] hover:text-[#164990] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#164990]"
                  >
                    #{order.orderNumber}
                  </Link>
                </TableCell>
                <TableCell className="px-6 py-2 text-[#051a50]">{formatOrderDate(order.createdAt)}</TableCell>
                <TableCell className="px-6 py-2">
                  <OrderStatusBadge status={order.status} />
                </TableCell>
                <TableCell className="px-6 py-2 text-[#051a50]">
                  {formatCurrency(order.total, order.currency)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="divide-y divide-[#dde2e8] md:hidden">
        {orders.map((order) => (
          <article key={order.id} className="space-y-3 p-4">
            <div className="flex items-center justify-between gap-3">
              <Link href={`/orders/${order.id}`} className="font-semibold text-[#164990]">
                #{order.orderNumber}
              </Link>
              <OrderStatusBadge status={order.status} />
            </div>
            <div className="flex items-end justify-between gap-3 text-sm">
              <div>
                <p className="text-xs text-[#73798f]">{t("orderDate")}</p>
                <p className="text-[#051a50]">{formatOrderDate(order.createdAt)}</p>
              </div>
              <strong className="text-[#051a50]">{formatCurrency(order.total, order.currency)}</strong>
            </div>
            <Button asChild variant="ghost" className="h-8 w-full justify-end px-0 font-normal text-[#164990]">
              <Link href={`/orders/${order.id}`}>
                {t("viewDetails")} <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </article>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#dde2e8] px-6 pb-4 pt-3">
        <p className="text-sm text-[#73798f]">{t("showing", { start, end, total })}</p>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={paginationButtonClassName}
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            {t("previous")}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={paginationButtonClassName}
            disabled={page >= Math.ceil(total / pageSize)}
            onClick={() => onPageChange(page + 1)}
          >
            {t("next")}
          </Button>
        </div>
      </div>
    </section>
  );
}
