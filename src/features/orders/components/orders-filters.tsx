import { Add, SearchNormal1 } from "iconsax-reactjs";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { ORDER_FILTER_STATUSES, orderFilterStatusSchema, type OrderFilterStatus } from "../schemas/order.schema";
import type { OrderPeriod, OrderPeriodSelection } from "../utils/order-period";
import { OrderPeriodFilter } from "./order-period-filter";
import { orderFilterStatusLabelKeys } from "./order-status-labels";

const ALL_STATUSES_VALUE = "all";
const SEARCH_DEBOUNCE_MS = 400;

type OrdersFiltersProps = {
  search: string;
  onSearchChange: (search: string) => void;
  status: OrderFilterStatus | undefined;
  onStatusChange: (status: OrderFilterStatus | undefined) => void;
  periodSelection: OrderPeriodSelection | undefined;
  period: OrderPeriod;
  onPeriodSelectionChange: (selection: OrderPeriodSelection) => void;
  onPeriodChange: (period: OrderPeriod) => void;
  onClearAll: () => void;
};

/** Keeps typing responsive and only commits the search term once the buyer pauses. */
function OrdersSearchInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const t = useTranslations("Orders");
  const [draft, setDraft] = useState(value);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => setDraft(value), [value]);

  useEffect(() => {
    if (draft.trim() === value.trim()) return;
    const timeout = window.setTimeout(() => onChangeRef.current(draft), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timeout);
  }, [draft, value]);

  return (
    <div className="relative w-full sm:w-[320px]">
      <SearchNormal1
        className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-[#73798f]"
        aria-hidden="true"
      />
      <Input
        type="search"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") onChangeRef.current(draft);
        }}
        maxLength={100}
        aria-label={t("searchOrders")}
        placeholder={t("searchPlaceholder")}
        className="h-11 rounded-full border-[#dde2e8] bg-white pl-[42px] pr-3.5 text-base text-[#051a50] shadow-[0_1px_1px_rgba(10,13,18,0.05)] placeholder:text-[#b1bac8]"
      />
    </div>
  );
}

export function OrdersFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  periodSelection,
  period,
  onPeriodSelectionChange,
  onPeriodChange,
  onClearAll,
}: OrdersFiltersProps) {
  const t = useTranslations("Orders");

  function handleValueChange(value: string) {
    const parsedStatus = orderFilterStatusSchema.safeParse(value);
    onStatusChange(parsedStatus.success ? parsedStatus.data : undefined);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <OrdersSearchInput value={search} onChange={onSearchChange} />
      <Select value={status ?? ALL_STATUSES_VALUE} onValueChange={handleValueChange}>
        <SelectTrigger
          aria-label={t("filterByStatus")}
          className="h-11 w-full rounded-full border-[#dde2e8] bg-white px-3.5 text-[13px] font-medium text-[#051a50] shadow-[0_1px_1px_rgba(10,13,18,0.05)] sm:w-[132px] [&>svg]:size-5 [&>svg]:opacity-100"
        >
          <SelectValue placeholder={t("status")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_STATUSES_VALUE}>{t("allStatuses")}</SelectItem>
          {ORDER_FILTER_STATUSES.map((filterStatus) => (
            <SelectItem key={filterStatus} value={filterStatus}>
              {t(`statuses.${orderFilterStatusLabelKeys[filterStatus]}`, { status: filterStatus })}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <OrderPeriodFilter
        value={periodSelection}
        period={period}
        onChange={onPeriodSelectionChange}
        onPeriodChange={onPeriodChange}
      />
      {search || status || periodSelection ? (
        <Button
          type="button"
          variant="ghost"
          className="h-11 gap-2 px-2 text-sm font-normal text-[#868da5] hover:bg-transparent hover:text-[#051a50]"
          onClick={onClearAll}
        >
          <Add className="size-5 rotate-45" aria-hidden="true" />
          {t("clearAll")}
        </Button>
      ) : null}
    </div>
  );
}
