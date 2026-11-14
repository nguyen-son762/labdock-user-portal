"use client";

import { ArrowRight } from "iconsax-reactjs";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { useCountdown } from "@/hooks/use-countdown";
import { Link } from "@/i18n/navigation";

import type { OrderDetail } from "../schemas/order.schema";
import { isOrderAwaitingPayment, isOrderPaymentSubmitted } from "../utils/is-order-awaiting-payment";
import { CancelPaymentDialog } from "./cancel-payment-dialog";
import { OrderDeliveryTracking } from "./order-delivery-tracking";
import { OrderInformationCards } from "./order-information-cards";
import { OrderItemsCard } from "./order-items-card";
import { OrderPaymentBanner, OrderPaymentSubmittedBanner } from "./order-payment-banner";
import { OrderStatusBadge } from "./order-status-badge";

export function OrderDetailContent({ order }: { order: OrderDetail }) {
  const t = useTranslations("Orders");
  const pending = isOrderAwaitingPayment(order.status);
  const paymentSubmitted = isOrderPaymentSubmitted(order.status);
  const cancelled = ["cancelled", "canceled"].includes(order.status.trim().toLowerCase());
  const remaining = useCountdown(pending ? order.paymentExpiresAt : null);

  return (
    <div className="mt-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <h1 className="break-all text-[28px] font-semibold leading-10 text-[#0f3678] sm:text-[32px]">
            #{order.orderNumber}
          </h1>
          <OrderStatusBadge status={order.status} />
        </div>
        {pending ? (
          <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
            <CancelPaymentDialog orderId={order.id} orderNumber={order.orderNumber}>
              <Button
                type="button"
                variant="outline"
                className="h-11 flex-1 rounded-full border-[#c8d0d9] px-5 font-normal text-[#051a50] shadow-sm sm:flex-none"
              >
                {t("cancelPayment")}
              </Button>
            </CancelPaymentDialog>
            {remaining !== null && remaining > 0 ? (
              <Button asChild variant="brand" className="h-11 flex-1 gap-4 pl-5 pr-1.5 shadow-none sm:flex-none">
                <Link href={`/payment?${new URLSearchParams({ orderId: order.id })}`}>
                  {t("continuePayment")}
                  <span className="flex size-8 items-center justify-center rounded-full bg-white/20">
                    <ArrowRight size={18} aria-hidden="true" />
                  </span>
                </Link>
              </Button>
            ) : (
              <Button disabled variant="brand" className="h-11 px-5">
                {t("continuePayment")}
              </Button>
            )}
          </div>
        ) : null}
      </div>
      {pending ? (
        <OrderPaymentBanner expiresAt={order.paymentExpiresAt} refCode={order.refCode} remaining={remaining} />
      ) : paymentSubmitted ? (
        <OrderPaymentSubmittedBanner refCode={order.refCode} />
      ) : !cancelled ? (
        <OrderDeliveryTracking status={order.status} />
      ) : null}
      <OrderItemsCard order={order} />
      <OrderInformationCards order={order} />
    </div>
  );
}
