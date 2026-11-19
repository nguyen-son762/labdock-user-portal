import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/class-names";

import type { RfqFilterStatus, RfqListSummary } from "../schemas/rfq.schema";
import { rfqStatusLabelKey } from "./rfq-status-badge";

/** Status chips shown next to the total, matching the RFQ list design. */
const summaryStatuses = ["Quoted", "Pending"] as const satisfies readonly RfqFilterStatus[];

type RfqsSummaryProps = {
  summary: RfqListSummary | null;
  total: number;
  activeStatus: RfqFilterStatus | undefined;
  onStatusChange: (status: RfqFilterStatus | undefined) => void;
};

export function RfqsSummary({ summary, total, activeStatus, onStatusChange }: RfqsSummaryProps) {
  const t = useTranslations("Rfqs");
  const countByStatus = new Map(summary?.countsByStatus.map((item) => [item.status.toLowerCase(), item.count]));

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      <Button
        type="button"
        aria-pressed={!activeStatus}
        onClick={() => onStatusChange(undefined)}
        className="flex h-11 items-center justify-between gap-2 rounded bg-gradient-to-b from-[#0f3678] to-[#2f7bc4] px-3 py-2 text-white hover:opacity-95"
      >
        <span className="text-sm font-medium">{t("total")}</span>
        <span className="text-base font-bold">{summary?.totalRfqs ?? total}</span>
      </Button>
      {summary
        ? summaryStatuses.map((status) => {
            const isActive = activeStatus === status;
            return (
              <Button
                key={status}
                type="button"
                variant="ghost"
                aria-pressed={isActive}
                onClick={() => onStatusChange(isActive ? undefined : status)}
                className={cn(
                  "flex h-11 items-center justify-between gap-2 rounded border border-transparent bg-white px-3 py-2 text-sm font-medium text-[#051a50] shadow-[0_1px_3px_rgba(10,13,18,0.1),0_1px_2px_rgba(10,13,18,0.06)] hover:bg-[#f3f8fc] hover:text-[#051a50]",
                  isActive && "border-[#2f7bc4] bg-[#f3f8fc]",
                )}
              >
                <span className="truncate">{t(`statuses.${rfqStatusLabelKey(status)}`, { status })}</span>
                <span className="inline-flex h-7 min-w-7 shrink-0 items-center justify-center rounded-2xl bg-[#ecf0f3] px-3 text-sm font-medium text-[#73798f]">
                  {countByStatus.get(status.toLowerCase()) ?? 0}
                </span>
              </Button>
            );
          })
        : null}
    </div>
  );
}
