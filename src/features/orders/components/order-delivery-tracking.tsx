"use client";

import { Copy, TickCircle } from "iconsax-reactjs";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/class-names";

import { orderDetailPlaceholders } from "../data/order-detail-placeholders";

export function OrderDeliveryTracking({ status }: { status: string }) {
  const t = useTranslations("Orders");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");
  const normalized = status.toLowerCase().replace(/[\s_-]+/g, "");
  const current = ["delivered", "completed"].includes(normalized)
    ? 3
    : normalized === "shipped"
      ? 2
      : ["processing", "awaitingshipment", "readytoship"].includes(normalized)
        ? 1
        : 0;
  const steps = [t("orderConfirmed"), t("statuses.awaitingShipment"), t("statuses.shipped"), t("statuses.delivered")];

  async function copyTracking() {
    try {
      await navigator.clipboard.writeText(orderDetailPlaceholders.trackingNumber);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  }

  return (
    <section
      className="overflow-hidden rounded-xl border border-[#ff9d00] bg-gradient-to-r from-[var(--brand-orange-start)] to-[var(--brand-orange-end)]"
      aria-labelledby="delivery-tracking-title"
    >
      <h2 id="delivery-tracking-title" className="px-6 py-1 text-base font-semibold text-white">
        {t("deliveryTracking")}
      </h2>
      <div className="rounded-t-xl bg-white px-3 pb-5 pt-5 sm:px-3">
        <ol className="mb-5 grid grid-cols-4" aria-label={t("deliveryTracking")}>
          {steps.map((label, index) => (
            <li
              key={label}
              aria-current={index === current ? "step" : undefined}
              className="relative min-w-0 text-center text-sm leading-5"
            >
              {index < 3 ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute left-1/2 right-[-50%] top-[7px] h-0.5",
                    index < current ? "bg-[#164990]" : "bg-[#c8d0d9]",
                  )}
                />
              ) : null}
              <span className="relative mx-auto mb-1 flex size-4 items-center justify-center bg-white">
                {index < current || current === 3 ? (
                  <TickCircle size={16} variant="Bold" className="text-[#0f3678]" aria-hidden="true" />
                ) : (
                  <span
                    className={cn(
                      "size-3 rounded-full border-[3px]",
                      index === current ? "border-[#0f3678] bg-white" : "border-white bg-[#adb7ca]",
                    )}
                  />
                )}
              </span>
              <span
                className={cn(
                  "block min-h-10 px-1 sm:min-h-0",
                  index === current ? "text-[#1f5fa8]" : "text-[#051a50]",
                )}
              >
                {label}
              </span>
              <span
                className={cn(
                  "mt-0.5 block px-1 text-xs sm:text-sm",
                  index === current ? "text-[#1f5fa8]" : "text-[#73798f]",
                )}
              >
                {index === 3 && current < 3
                  ? t("estimatedDate", { date: orderDetailPlaceholders.trackingDates[index] ?? "" })
                  : orderDetailPlaceholders.trackingDates[index]}
              </span>
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-lg bg-[#f5f7f8] px-3 py-1 text-sm text-[#051a50]">
          <span className="inline-flex items-center">
            {t("trackingNumber")}:{" "}
            <strong className="ml-1 font-medium">{orderDetailPlaceholders.trackingNumber}</strong>
            <Button
              variant="ghost"
              size="icon"
              className="ml-0.5 size-5 text-[#73798f]"
              onClick={() => void copyTracking()}
              aria-label={t("copyTracking")}
            >
              <Copy size={16} aria-hidden="true" />
            </Button>
          </span>
          <span aria-hidden="true">•</span>
          <span>
            {t("carrier")}: {orderDetailPlaceholders.carrier}
          </span>
        </div>
        <span className="sr-only" role="status">
          {copyStatus === "copied" ? t("trackingCopied") : copyStatus === "error" ? t("trackingCopyError") : ""}
        </span>
      </div>
    </section>
  );
}
