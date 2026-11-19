"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getOrderPeriodRange,
  orderPeriodSchema,
  parseOrderPeriodSelection,
  type OrderPeriod,
  type OrderPeriodSelection,
} from "@/features/orders";
import { getApiErrorMessage } from "@/lib/api-error";

import { useRfqsQuery } from "../api/use-rfqs-query";
import { rfqFilterStatusSchema, rfqFiltersSchema, type RfqFilterStatus } from "../schemas/rfq.schema";
import { RfqsEmptyState } from "./rfqs-empty-state";
import { RfqsFilters } from "./rfqs-filters";
import { RfqsSummary } from "./rfqs-summary";
import { RfqsTable } from "./rfqs-table";

function parseFilters(searchParams: URLSearchParams, periodSelection: OrderPeriodSelection | undefined) {
  const page = Number(searchParams.get("page") ?? 1);
  const status = rfqFilterStatusSchema.safeParse(searchParams.get("status"));
  return rfqFiltersSchema.parse({
    page: Number.isInteger(page) && page > 0 ? page : 1,
    pageSize: 10,
    status: status.success ? status.data : undefined,
    search: searchParams.get("search")?.trim().slice(0, 100) || undefined,
    ...(periodSelection ? getOrderPeriodRange(periodSelection) : {}),
  });
}

export function RfqsScreen() {
  const tErrors = useTranslations("ApiErrors");
  const t = useTranslations("Rfqs");
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const periodSelection = parseOrderPeriodSelection(searchParams.get("period"), searchParams.get("date"));
  const filters = parseFilters(searchParams, periodSelection);
  const parsedPeriod = orderPeriodSchema.safeParse(searchParams.get("period"));
  const period = periodSelection?.period ?? (parsedPeriod.success ? parsedPeriod.data : "month");
  const rfqsQuery = useRfqsQuery(filters);

  function updateParams(updates: Record<string, string | number | null>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) =>
      value === null || value === "" ? params.delete(key) : params.set(key, String(value)),
    );
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function handleStatusChange(status: RfqFilterStatus | undefined) {
    updateParams({ status: status ?? null, page: null });
  }

  function handleSearchChange(search: string) {
    updateParams({ search: search.trim() || null, page: null });
  }

  function handlePeriodSelectionChange(selection: OrderPeriodSelection) {
    updateParams({ period: selection.period, date: selection.anchor, page: null });
  }

  function handlePeriodChange(nextPeriod: OrderPeriod) {
    updateParams(periodSelection ? { period: nextPeriod, page: null } : { period: nextPeriod });
  }

  function handleClearAll() {
    updateParams({ search: null, status: null, period: null, date: null, page: null });
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] px-5 pb-12 pt-6 sm:px-10 xl:px-[100px]">
      <Breadcrumbs items={[{ label: t("home"), href: "/" }, { label: t("title") }]} />
      <h1 className="mb-4 mt-1 text-[32px] font-semibold leading-none text-[#0f3678]">{t("title")}</h1>
      <RfqsFilters
        search={filters.search ?? ""}
        onSearchChange={handleSearchChange}
        status={filters.status}
        onStatusChange={handleStatusChange}
        periodSelection={periodSelection}
        period={period}
        onPeriodSelectionChange={handlePeriodSelectionChange}
        onPeriodChange={handlePeriodChange}
        onClearAll={handleClearAll}
      />
      {rfqsQuery.isPending ? (
        <div className="mt-4 space-y-3" aria-label={t("loading")} aria-busy="true">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-[480px] w-full rounded-xl" />
        </div>
      ) : null}
      {rfqsQuery.isError ? <Alert className="mt-4">{getApiErrorMessage(rfqsQuery.error, tErrors)}</Alert> : null}
      {rfqsQuery.data ? (
        <div
          className={
            rfqsQuery.isFetching ? "mt-4 space-y-4 opacity-70 transition-opacity" : "mt-4 space-y-4 transition-opacity"
          }
          aria-busy={rfqsQuery.isFetching}
        >
          <RfqsSummary
            summary={rfqsQuery.data.summary}
            total={rfqsQuery.data.total}
            activeStatus={filters.status}
            onStatusChange={handleStatusChange}
          />
          {rfqsQuery.data.items.length ? (
            <RfqsTable
              rfqs={rfqsQuery.data.items}
              total={rfqsQuery.data.total}
              page={rfqsQuery.data.page}
              pageSize={rfqsQuery.data.pageSize}
              onPageChange={(page) => updateParams({ page })}
            />
          ) : (
            <RfqsEmptyState isFiltered={Boolean(filters.search || filters.status || periodSelection)} />
          )}
        </div>
      ) : null}
    </div>
  );
}
