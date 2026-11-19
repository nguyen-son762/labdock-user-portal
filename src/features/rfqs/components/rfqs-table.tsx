import { ArrowRight, ArrowUp } from "iconsax-reactjs";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import type { RfqSummary } from "../schemas/rfq.schema";
import { formatRfqCurrency, formatRfqDate } from "../utils/rfq-formatters";
import { RfqStatusBadge } from "./rfq-status-badge";

const EMPTY_VALUE = "-";
const paginationButtonClassName =
  "h-[34px] rounded-full border-[#dde2e8] px-3.5 text-sm font-medium text-[#051a50] shadow-[0_1px_2px_rgba(10,13,18,0.05)] disabled:text-[#c8d0d9] disabled:opacity-100";

/** The quoted total once a supplier has quoted, otherwise the estimate from listed prices. */
function formatTotalValue(rfq: RfqSummary) {
  const value = rfq.quotedTotal ?? rfq.estimatedValue;
  return value === null ? EMPTY_VALUE : formatRfqCurrency(value, rfq.currency);
}

function formatValidUntil(rfq: RfqSummary) {
  return rfq.quoteExpiresAt ? formatRfqDate(rfq.quoteExpiresAt) : EMPTY_VALUE;
}

export function RfqsTable({
  rfqs,
  total,
  page,
  pageSize,
  onPageChange,
}: {
  rfqs: RfqSummary[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  const t = useTranslations("Rfqs");
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min((page - 1) * pageSize + rfqs.length, total);

  if (rfqs.length === 0) return null;

  return (
    <section className="overflow-hidden rounded-xl border border-[#dde2e8] bg-white" aria-label={t("tableLabel")}>
      <div className="hidden md:block">
        <Table className="text-[#051a50]">
          <TableHeader className="bg-[#ecf0f3] [&_th]:h-[52px] [&_th]:border-r [&_th]:border-white [&_th]:px-6 [&_th]:text-[13px] [&_th]:font-medium [&_th]:text-[#051a50] [&_th:last-child]:border-0">
            <TableRow className="border-[#dde2e8] hover:bg-[#ecf0f3]">
              <TableHead className="w-1/6">{t("number")}</TableHead>
              <TableHead className="w-1/6">{t("dateSubmitted")}</TableHead>
              <TableHead className="w-1/6">{t("totalProducts")}</TableHead>
              <TableHead className="w-1/6">{t("totalValue")}</TableHead>
              <TableHead className="w-1/6">
                <span className="inline-flex items-center gap-1.5">
                  {t("status")}
                  <ArrowUp className="size-4" aria-hidden="true" />
                </span>
              </TableHead>
              <TableHead className="w-1/6">{t("validUntil")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="[&_td]:px-6 [&_td]:py-2 [&_td]:text-base">
            {rfqs.map((rfq) => (
              <TableRow key={rfq.id} className="h-[58px] border-[#dde2e8] hover:bg-[#f9fcff]">
                <TableCell>
                  <Link
                    href={`/rfqs/${rfq.id}`}
                    className="font-medium text-[#051a50] hover:text-[#164990] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#164990]"
                  >
                    #{rfq.rfqNumber}
                  </Link>
                </TableCell>
                <TableCell>{formatRfqDate(rfq.createdAt)}</TableCell>
                <TableCell>{rfq.itemCount}</TableCell>
                <TableCell>{formatTotalValue(rfq)}</TableCell>
                <TableCell>
                  <RfqStatusBadge status={rfq.status} />
                </TableCell>
                <TableCell>{formatValidUntil(rfq)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="divide-y divide-[#dde2e8] md:hidden">
        {rfqs.map((rfq) => (
          <article key={rfq.id} className="space-y-3 p-4">
            <div className="flex items-center justify-between gap-3">
              <Link href={`/rfqs/${rfq.id}`} className="font-semibold text-[#051a50]">
                #{rfq.rfqNumber}
              </Link>
              <RfqStatusBadge status={rfq.status} />
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-[#73798f]">{t("dateSubmitted")}</dt>
                <dd className="text-[#051a50]">{formatRfqDate(rfq.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs text-[#73798f]">{t("totalProducts")}</dt>
                <dd className="text-[#051a50]">{rfq.itemCount}</dd>
              </div>
              <div>
                <dt className="text-xs text-[#73798f]">{t("totalValue")}</dt>
                <dd className="text-[#051a50]">{formatTotalValue(rfq)}</dd>
              </div>
              <div>
                <dt className="text-xs text-[#73798f]">{t("validUntil")}</dt>
                <dd className="text-[#051a50]">{formatValidUntil(rfq)}</dd>
              </div>
            </dl>
            <Button asChild variant="ghost" className="h-8 w-full justify-end px-0 font-normal text-[#164990]">
              <Link href={`/rfqs/${rfq.id}`}>
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
