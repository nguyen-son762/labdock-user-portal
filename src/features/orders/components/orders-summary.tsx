import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/class-names";

import type { OrderFilterStatus, OrderListSummary } from "../schemas/order.schema";
import { formatCurrency } from "../utils/order-formatters";

/**
 * Status cells shown in the summary bar, matching the order list design. A cell that groups several statuses
 * only shows their summed count: the list API filters by one status at a time.
 */
const summaryStatuses = [
  { key: "awaitingShipment", statuses: ["PendingPayment"] },
  { key: "shipped", statuses: ["Shipped"] },
  { key: "delivered", statuses: ["Delivered"] },
] as const satisfies readonly { key: string; statuses: readonly OrderFilterStatus[] }[];

const chipClassName =
  "flex h-11 items-center justify-between gap-2 rounded border border-transparent bg-white px-3 py-2 text-sm font-medium text-[#051a50] shadow-[0_1px_3px_rgba(10,13,18,0.1),0_1px_2px_rgba(10,13,18,0.06)]";

function SummaryCount({ count }: { count: number }) {
  return (
    <span className="inline-flex h-7 min-w-7 shrink-0 items-center justify-center rounded-2xl bg-[#ecf0f3] px-3 text-sm font-medium text-[#73798f]">
      {count}
    </span>
  );
}

type OrdersSummaryProps = {
  summary: OrderListSummary | null;
  total: number;
  activeStatus: OrderFilterStatus | undefined;
  onStatusChange: (status: OrderFilterStatus | undefined) => void;
};

function SummaryChip({
  label,
  count,
  isActive,
  onClick,
}: {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      aria-pressed={isActive}
      onClick={onClick}
      className={cn(
        chipClassName,
        "hover:bg-[#f3f8fc] hover:text-[#051a50]",
        isActive && "border-[#2f7bc4] bg-[#f3f8fc]",
      )}
    >
      <span className="truncate">{label}</span>
      <SummaryCount count={count} />
    </Button>
  );
}

export function OrdersSummary({ summary, total, activeStatus, onStatusChange }: OrdersSummaryProps) {
  const t = useTranslations("Orders");
  const countByStatus = new Map(summary?.countsByStatus.map((item) => [item.status, item.count]));

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {summary ? (
        <dl className="flex h-11 items-center justify-between gap-2 rounded bg-gradient-to-b from-[#0f3678] to-[#2f7bc4] px-3 py-2 text-white">
          <dt className="text-sm font-medium">{t("totalSpent")}</dt>
          <dd className="text-base font-bold">{formatCurrency(summary.totalSpent, summary.currency ?? undefined)}</dd>
        </dl>
      ) : null}
      <SummaryChip
        label={t("totalOrders")}
        count={summary?.totalOrders ?? total}
        isActive={!activeStatus}
        onClick={() => onStatusChange(undefined)}
      />
      {summary
        ? summaryStatuses.map(({ key, statuses }) => {
            const label = t(`statuses.${key}`, { status: key });
            const count = statuses.reduce((sum, status) => sum + (countByStatus.get(status) ?? 0), 0);
            if (statuses.length > 1) {
              return (
                <div key={key} className={chipClassName}>
                  <span className="truncate">{label}</span>
                  <SummaryCount count={count} />
                </div>
              );
            }
            const [status] = statuses;
            return (
              <SummaryChip
                key={key}
                label={label}
                count={count}
                isActive={activeStatus === status}
                onClick={() => onStatusChange(activeStatus === status ? undefined : status)}
              />
            );
          })
        : null}
    </div>
  );
}
