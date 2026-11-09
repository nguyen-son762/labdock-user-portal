"use client";

import { Timer } from "iconsax-reactjs";
import { useLocale, useTranslations } from "next-intl";

export function OrderPaymentBanner({
  expiresAt,
  refCode,
  remaining,
}: {
  expiresAt: string | null;
  refCode: string;
  remaining: number | null;
}) {
  const t = useTranslations("Orders");
  const locale = useLocale();
  const duration =
    remaining === null
      ? "--:--:--"
      : [Math.floor(remaining / 3600), Math.floor((remaining % 3600) / 60), remaining % 60]
          .map((value) => String(value).padStart(2, "0"))
          .join(":");
  const deadline = expiresAt
    ? new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Singapore",
      }).format(new Date(expiresAt))
    : "—";

  return (
    <section
      className="flex items-center gap-4 rounded-xl border border-[#ff9d00] bg-[#fff0ca] px-4 py-3.5 text-[#051a50]"
      aria-labelledby="order-payment-title"
    >
      <Timer size={24} className="shrink-0 text-[#ed8500]" aria-hidden="true" />
      <div className="min-w-0 space-y-1">
        <h2 id="order-payment-title" className="text-base font-semibold leading-6">
          {remaining === 0 ? (
            t("paymentExpired")
          ) : (
            <>
              {t("awaitingPayment")} —{" "}
              <span className="whitespace-nowrap">
                <span role="timer" aria-label={t("timeRemaining")} className="tabular-nums">
                  {duration}
                </span>{" "}
                {t("timeLeft")}
              </span>
            </>
          )}
        </h2>
        <p className="break-words text-sm leading-5 text-[#73798f]">
          {remaining === 0 ? t("paymentExpiredHelp") : t("paymentReminder", { refCode: refCode || "—", deadline })}
        </p>
      </div>
    </section>
  );
}
