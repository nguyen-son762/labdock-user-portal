"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrderDetailQuery } from "@/features/orders";

import { formatCurrency } from "../data/checkout-data";

export function PaymentSuccessScreen({ orderId }: { orderId: string }) {
  const t = useTranslations("Checkout");
  const orderQuery = useOrderDetailQuery(orderId, { refetchOnMount: "always" });
  const isLoading = orderQuery.isPending || (orderQuery.isFetching && !orderQuery.isFetchedAfterMount);
  const order = isLoading || orderQuery.isError ? undefined : orderQuery.data;

  return (
    <section
      className="relative isolate flex min-h-[490px] flex-col items-center justify-center overflow-hidden pb-12 pt-8 sm:h-[490px]"
      aria-label={t("paymentSuccess")}
    >
      <Image
        src="/checkout/payment-success/background.png"
        alt=""
        fill
        priority
        unoptimized
        sizes="100vw"
        className="-z-20 object-cover"
      />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[#f9fcff] mix-blend-hue" />
      {isLoading ? (
        <div className="w-full max-w-[600px] space-y-4 p-6" aria-label={t("loadingPayment")}>
          <Skeleton className="mx-auto size-14 rounded-full" />
          <Skeleton className="h-10" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      ) : null}
      {orderQuery.isError ? (
        <div className="flex w-full max-w-[600px] flex-col items-center gap-4 p-6">
          <Alert>{t("loadPaymentError")}</Alert>
          <Button type="button" onClick={() => void orderQuery.refetch()}>
            {t("retryPayment")}
          </Button>
        </div>
      ) : null}
      {order ? (
        <div className="flex w-full shrink-0 flex-col items-center gap-4 p-6 text-center text-[#051a50]">
          <div className="flex w-full max-w-[552px] flex-col items-center gap-8">
            <div className="flex flex-col items-center gap-3">
              <span className="flex size-[57.142px] items-center justify-center rounded-full border-[5.714px] border-[#f9fcff]/50">
                <span className="relative flex size-[45.714px] shrink-0 items-center justify-center rounded-full">
                  <Image
                    src="/checkout/payment-success/icon-background.png"
                    alt=""
                    fill
                    sizes="46px"
                    className="rounded-full object-cover"
                  />
                  <Image
                    src="/checkout/payment-success/check-circle.svg"
                    alt=""
                    width={22.8571}
                    height={22.8571}
                    className="relative"
                  />
                </span>
              </span>
              <h1 className="text-[32px] font-semibold leading-[1.2] text-[#0f3678]">{t("paymentSuccess")}</h1>
            </div>
            <div className="flex w-full flex-col items-center gap-2 text-sm leading-5">
              <p>{t("thankYou")}</p>
              <p className="min-h-6 max-w-full break-words">{t("orderEmail", { email: order.invoice.buyerEmail })}</p>
              <div className="flex w-full flex-col items-center gap-1 rounded-2xl border border-white bg-gradient-to-b from-white to-white/50 px-2 py-4 font-semibold">
                <p className="text-base leading-6">{t("orderTotal")}</p>
                <strong className="text-xl font-semibold leading-[30px] text-[#164990]">
                  {formatCurrency(order.total, order.currency)}
                </strong>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              asChild
              variant="outline"
              className="h-11 rounded-full border-[#c8d0d9] bg-white px-3.5 font-normal text-[#73798f] shadow-[0_1px_2px_rgba(10,13,18,0.05)]"
            >
              <Link href="/">{t("backHome")}</Link>
            </Button>
            <Button asChild variant="brand" className="h-11 gap-4 pl-5 pr-1.5">
              <Link href="/products">
                {t("continueShopping")}
                <span className="flex size-8 items-center justify-center rounded-full bg-[#efa33b] shadow-[0_0_15px_rgba(229,122,0,0.5)]">
                  <Image src="/checkout/bank-transfer/arrow-right.svg" alt="" width={16} height={16} />
                </span>
              </Link>
            </Button>
          </div>
          <Link
            href={`/orders/${order.id}`}
            className="rounded text-base leading-6 text-[#164990] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#164990]"
          >
            {t("viewOrderDetails")}
          </Link>
        </div>
      ) : null}
    </section>
  );
}
