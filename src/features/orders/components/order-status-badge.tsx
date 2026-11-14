import { cn } from "@/lib/class-names";
import { useTranslations } from "next-intl";
import { isOrderAwaitingPayment } from "../utils/is-order-awaiting-payment";

type OrderStatusTranslationKey =
  | "draft"
  | "new"
  | "pending"
  | "paymentSubmitted"
  | "failed"
  | "paid"
  | "processing"
  | "awaitingShipment"
  | "awaitingPayment"
  | "shipped"
  | "delivered"
  | "completed"
  | "cancelled"
  | "unknown";

const statusConfig: Record<string, { key: OrderStatusTranslationKey; className: string; dot: string }> = {
  draft: { key: "draft", className: "bg-[#ecf0f3] text-[#596579]", dot: "bg-[#73798f]" },
  new: { key: "new", className: "bg-[#eaf3ff] text-[#1f5fa8]", dot: "bg-[#1f5fa8]" },
  paymentsubmitted: { key: "paymentSubmitted", className: "bg-[#fffbb7] text-[#88580b]", dot: "bg-[#c7930a]" },
  failed: { key: "failed", className: "bg-[#fff0f1] text-[#e81643]", dot: "bg-[#f04468]" },
  pending: { key: "pending", className: "bg-[#fffbb7] text-[#88580b]", dot: "bg-[#c7930a]" },
  paid: { key: "paid", className: "bg-[#d9f2e1] text-[#217a4f]", dot: "bg-[#279968]" },
  processing: { key: "processing", className: "bg-[#eaf3ff] text-[#1f5fa8]", dot: "bg-[#1f5fa8]" },
  "awaiting-shipment": { key: "awaitingShipment", className: "bg-[#fffbb7] text-[#88580b]", dot: "bg-[#c7930a]" },
  awaitingpayment: { key: "awaitingPayment", className: "bg-[#fffbb7] text-[#88580b]", dot: "bg-[#c7930a]" },
  shipped: { key: "shipped", className: "bg-[#f4f3ff] text-[#6938ef]", dot: "bg-[#6938ef]" },
  delivered: { key: "delivered", className: "bg-[#d9f2e1] text-[#217a4f]", dot: "bg-[#279968]" },
  completed: { key: "completed", className: "bg-[#d9f2e1] text-[#217a4f]", dot: "bg-[#279968]" },
  cancelled: { key: "cancelled", className: "bg-[#fff0f1] text-[#e81643]", dot: "bg-[#f04468]" },
  canceled: { key: "cancelled", className: "bg-[#fff0f1] text-[#e81643]", dot: "bg-[#f04468]" },
};

export function OrderStatusBadge({ status }: { status: string }) {
  const t = useTranslations("Orders.statuses");
  if (isOrderAwaitingPayment(status))
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-[#fff9ea] px-3 py-1.5 text-sm font-medium text-[#b94f00]">
        <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
        {t("pendingPayment")}
      </span>
    );
  const normalizedStatus = status
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-");
  const config = statusConfig[normalizedStatus] ??
    statusConfig[normalizedStatus.replaceAll("-", "")] ?? {
      key: "unknown",
      className: "bg-[#ecf0f3] text-[#596579]",
      dot: "bg-[#73798f]",
    };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-2xl py-0.5 pl-1.5 pr-2 text-xs font-medium leading-normal",
        config.className,
      )}
    >
      <span className="flex size-2 items-center justify-center" aria-hidden="true">
        <span className={cn("size-1.5 rounded-full", config.dot)} />
      </span>
      {t(config.key, { status })}
    </span>
  );
}

export function getOrderStatusLabel(status: string) {
  return status;
}
