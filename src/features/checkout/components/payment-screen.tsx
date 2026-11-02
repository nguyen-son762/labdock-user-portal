"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrderDetailQuery } from "@/features/orders";

import { formatCurrency } from "../data/checkout-data";
import { PaymentCountdown } from "./payment-countdown";

export function PaymentScreen({ orderId }: { orderId: string }) {
  const t = useTranslations("Checkout");
  const tHeader = useTranslations("Header");
  const orderQuery = useOrderDetailQuery(orderId, { refetchOnMount: "always" });
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");
  const isLoadingPayment = orderQuery.isPending || (orderQuery.isFetching && !orderQuery.isFetchedAfterMount);
  const order = isLoadingPayment || orderQuery.isError ? undefined : orderQuery.data;

  async function copyReference() {
    if (!order) return;
    try {
      await navigator.clipboard.writeText(order.orderNumber);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  }

  return (
    <div className="bg-[#f9fcff]">
      <div className="mx-auto w-full max-w-[1272px] px-4 pb-[50px] pt-8">
        <Breadcrumbs
          items={[
            { label: tHeader("home"), href: "/" },
            { label: t("shoppingCart"), href: "/cart" },
            { label: t("checkout"), href: "/checkout" },
            { label: t("payment") },
          ]}
        />
        <h1 className="mt-3 text-[32px] font-semibold leading-[44px] text-[#0f3678]">{t("payment")}</h1>
        {isLoadingPayment ? (
          <div
            className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_392px]"
            aria-label={t("loadingPayment")}
          >
            <Skeleton className="h-[650px] rounded-xl" />
            <Skeleton className="h-[408px] rounded-xl" />
          </div>
        ) : null}
        {orderQuery.isError ? (
          <div className="mt-6 space-y-4">
            <Alert>{t("loadPaymentError")}</Alert>
            <Button type="button" onClick={() => void orderQuery.refetch()}>
              {t("retryPayment")}
            </Button>
          </div>
        ) : null}
        {order ? (
          <div className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_392px]">
            <section
              className="min-w-0 space-y-6 rounded-xl border border-[#ecf0f3] bg-white p-4"
              aria-labelledby="payment-method-title"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-[#dde2e8] bg-[#f5f7f8]">
                  <Image src="/checkout/bank-transfer/card.svg" alt="" width={24} height={24} />
                </span>
                <div>
                  <h2 id="payment-method-title" className="text-2xl font-semibold leading-8 text-[#051a50]">
                    {t("bankTransfer")}
                  </h2>
                  <p className="text-sm leading-5 text-[#73798f]">{t("scanQr")}</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-6 rounded-xl bg-[#f5f7f8] p-4 text-center sm:p-6">
                <div className="flex w-full flex-col items-center gap-3">
                  <Image
                    src="/checkout/bank-transfer/qr.png"
                    alt={t("bankTransferQr")}
                    width={300}
                    height={300}
                    priority
                    unoptimized
                    className="h-auto w-full max-w-[300px]"
                  />
                  <div className="flex w-full flex-col items-center gap-2 text-[#051a50]">
                    <strong className="text-lg font-semibold leading-6 text-[#1f5fa8]">
                      {t("amount", { amount: formatCurrency(order.total, order.currency) })}
                    </strong>
                    <p className="text-base font-semibold leading-6">{t("companyName")}: i-DNA</p>
                    <p className="text-base font-semibold leading-6">{t("businessRegistration")}: 202012345Z</p>
                    <div className="flex max-w-full flex-wrap items-center justify-center gap-2 text-base font-semibold leading-6">
                      <span>{t("refCode")}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        aria-label={t("copyReference")}
                        onClick={() => void copyReference()}
                        className="h-auto max-w-full gap-1.5 rounded-md border border-dashed border-[#1f5fa8] bg-[#f2f7fd] py-1 pl-2.5 pr-2 text-base text-[#1f5fa8] hover:bg-[#e6f0fb]"
                      >
                        <span className="break-all whitespace-normal text-left">{order.orderNumber}</span>
                        <Image
                          src="/checkout/bank-transfer/copy.svg"
                          alt=""
                          width={16}
                          height={16}
                          className="shrink-0"
                        />
                      </Button>
                    </div>
                    <span role="status" className={copyStatus === "error" ? "text-sm text-destructive" : "sr-only"}>
                      {copyStatus === "copied"
                        ? t("referenceCopied")
                        : copyStatus === "error"
                          ? t("copyReferenceError")
                          : ""}
                    </span>
                    <p className="text-sm leading-5 text-[#73798f]">{t("transferReferenceHelp")}</p>
                  </div>
                </div>
                <p className="text-sm leading-5 text-[#73798f]">{t("transferQrHelp")}</p>
              </div>
            </section>
            <PaymentCountdown orderId={order.id} createdAt={order.createdAt} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
