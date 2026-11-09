"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@/i18n/navigation";
import { useCountdown } from "@/hooks/use-countdown";

export function PaymentCountdown({ orderId, paymentExpiresAt }: { orderId: string; paymentExpiresAt: string }) {
  const t = useTranslations("Checkout");
  const locale = useLocale();
  const router = useRouter();
  const deadline = new Date(paymentExpiresAt).getTime();
  const remaining = useCountdown(paymentExpiresAt);
  const [deadlineLabel, setDeadlineLabel] = useState("");

  useEffect(() => {
    setDeadlineLabel(
      new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-SG", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(deadline),
    );
  }, [deadline, locale]);

  const expired = remaining === 0;
  const units = [
    { label: t("hours"), value: remaining === null ? "--" : String(Math.floor(remaining / 3600)).padStart(2, "0") },
    {
      label: t("minutes"),
      value: remaining === null ? "--" : String(Math.floor((remaining % 3600) / 60)).padStart(2, "0"),
    },
    { label: t("seconds"), value: remaining === null ? "--" : String(remaining % 60).padStart(2, "0") },
  ];

  return (
    <aside
      className="space-y-4 overflow-hidden rounded-xl border border-[#e9eaeb] bg-white p-4"
      aria-labelledby="transfer-countdown-title"
    >
      <h2
        id="transfer-countdown-title"
        className="flex items-center gap-2 text-lg font-semibold leading-6 text-[#051a50]"
      >
        <Image src="/checkout/bank-transfer/timer.svg" alt="" width={24} height={24} />
        {t("completePaymentWithin")}
      </h2>
      <div
        role="timer"
        aria-label={t("completePaymentWithin")}
        className="flex items-start justify-center gap-2 rounded-xl bg-[#fdefca] px-2 py-4 text-[#e57a00]"
      >
        {units.map((unit, index) => (
          <div key={unit.label} className="contents">
            {index > 0 ? (
              <span aria-hidden="true" className="flex h-16 items-center text-[32px] font-semibold">
                :
              </span>
            ) : null}
            <div className="flex min-w-0 flex-col items-center gap-1.5">
              <span className="flex h-16 w-[60px] items-center justify-center rounded-lg border border-[#efa33b] bg-white text-[32px] font-semibold tabular-nums min-[375px]:w-[72px]">
                {unit.value}
              </span>
              <span className="text-sm leading-5 text-[#73798f]">{unit.label}</span>
            </div>
          </div>
        ))}
      </div>
      <p className="text-sm leading-5 text-[#73798f]" role={expired ? "status" : undefined}>
        {expired ? t("transferExpired") : t("transferDeadline", { deadline: deadlineLabel || "…" })}
      </p>
      <div className="h-px bg-[#e9eaeb]" />
      <div className="space-y-4">
        <Button
          type="button"
          variant="brand"
          disabled={remaining === null || expired}
          onClick={() => router.push(`/payment/success?${new URLSearchParams({ orderId })}`)}
          className="h-11 w-full gap-4 pl-5 pr-1.5"
        >
          {t("iveTransferred")}
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#efa33b] shadow-[0_0_15px_rgba(229,122,0,0.5)]">
            <Image src="/checkout/bank-transfer/arrow-right.svg" alt="" width={16} height={16} />
          </span>
        </Button>
        <Button
          asChild
          variant="outline"
          className="h-11 w-full rounded-full border-[#c8d0d9] bg-white font-normal text-[#051a50] shadow-[0_1px_2px_rgba(10,13,18,0.05)]"
        >
          <Link href={expired ? `/orders/${orderId}` : "/checkout"}>
            {expired ? t("viewOrder") : t("cancelPayment")}
          </Link>
        </Button>
      </div>
    </aside>
  );
}
