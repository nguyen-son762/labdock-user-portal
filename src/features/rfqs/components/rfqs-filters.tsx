import { Add } from "iconsax-reactjs";
import { useTranslations } from "next-intl";

import { DebouncedSearchInput } from "@/components/shared/debounced-search-input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OrderPeriodFilter, type OrderPeriod, type OrderPeriodSelection } from "@/features/orders";

import { RFQ_FILTER_STATUSES, rfqFilterStatusSchema, type RfqFilterStatus } from "../schemas/rfq.schema";
import { rfqStatusLabelKey } from "./rfq-status-badge";

const ALL_STATUSES_VALUE = "all";

type RfqsFiltersProps = {
  search: string;
  onSearchChange: (search: string) => void;
  status: RfqFilterStatus | undefined;
  onStatusChange: (status: RfqFilterStatus | undefined) => void;
  periodSelection: OrderPeriodSelection | undefined;
  period: OrderPeriod;
  onPeriodSelectionChange: (selection: OrderPeriodSelection) => void;
  onPeriodChange: (period: OrderPeriod) => void;
  onClearAll: () => void;
};

export function RfqsFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  periodSelection,
  period,
  onPeriodSelectionChange,
  onPeriodChange,
  onClearAll,
}: RfqsFiltersProps) {
  const t = useTranslations("Rfqs");

  function handleStatusValueChange(value: string) {
    const parsedStatus = rfqFilterStatusSchema.safeParse(value);
    onStatusChange(parsedStatus.success ? parsedStatus.data : undefined);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <DebouncedSearchInput
        value={search}
        onChange={onSearchChange}
        label={t("searchRfqs")}
        placeholder={t("searchPlaceholder")}
      />
      <Select value={status ?? ALL_STATUSES_VALUE} onValueChange={handleStatusValueChange}>
        <SelectTrigger
          aria-label={t("filterByStatus")}
          className="h-11 w-full rounded-full border-[#dde2e8] bg-white px-3.5 text-[13px] font-medium text-[#051a50] shadow-[0_1px_1px_rgba(10,13,18,0.05)] sm:w-[132px] [&>svg]:size-5 [&>svg]:opacity-100"
        >
          <SelectValue placeholder={t("status")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_STATUSES_VALUE}>{t("allStatuses")}</SelectItem>
          {RFQ_FILTER_STATUSES.map((filterStatus) => (
            <SelectItem key={filterStatus} value={filterStatus}>
              {t(`statuses.${rfqStatusLabelKey(filterStatus)}`, { status: filterStatus })}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <OrderPeriodFilter
        value={periodSelection}
        period={period}
        onChange={onPeriodSelectionChange}
        onPeriodChange={onPeriodChange}
        label={t("filterByDate")}
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
