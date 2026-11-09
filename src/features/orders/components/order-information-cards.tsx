import { Card as CardIcon, DocumentDownload } from "iconsax-reactjs";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { orderDetailPlaceholders } from "../data/order-detail-placeholders";
import type { OrderDetail } from "../schemas/order.schema";
import { formatCurrency } from "../utils/order-formatters";
import { isOrderAwaitingPayment } from "../utils/is-order-awaiting-payment";
import { parseOrderDeliveryAddress } from "../utils/parse-order-delivery-address";

export function OrderInformationCards({ order }: { order: OrderDetail }) {
  const t = useTranslations("Orders");
  const address = parseOrderDeliveryAddress(order.shippingSnapshotJson);
  const pending = isOrderAwaitingPayment(order.status);
  const cancelled = ["cancelled", "canceled"].includes(order.status.toLowerCase());

  return (
    <div className="grid items-stretch gap-4 md:grid-cols-2">
      <Card className="overflow-hidden border-[#dde2e8] !shadow-none">
        <h2 className="border-b border-[#dde2e8] px-4 py-3 text-lg font-semibold leading-6 text-[#1f5fa8]">
          {t("deliveryAddress")}
        </h2>
        <div className="space-y-2 p-4 pt-6 text-sm text-[#73798f]">
          {address?.recipient || address?.address || address?.phone ? (
            <>
              {address.recipient ? <p className="text-base font-semibold text-[#051a50]">{address.recipient}</p> : null}
              <div className="max-w-[320px] space-y-2 text-center">
                {address.address ? <p>{address.address}</p> : null}
                {address.phone ? <p>{address.phone}</p> : null}
              </div>
            </>
          ) : (
            <p>{t("noShippingDetails")}</p>
          )}
        </div>
      </Card>
      <Card className="overflow-hidden border-[#dde2e8] !shadow-none">
        <h2 className="border-b border-[#dde2e8] px-4 py-3 text-lg font-semibold leading-6 text-[#1f5fa8]">
          {t("payment")}
        </h2>
        <div className="px-3 pb-3 pt-6 sm:px-4">
          <div className="flex items-start gap-4">
            {pending || cancelled ? (
              <CardIcon size={28} className="shrink-0 text-[#1f5fa8]" aria-hidden="true" />
            ) : (
              <Image src="/orders/visa.svg" alt="Visa" width={28} height={20} className="mt-0.5 shrink-0" />
            )}
            <div className="space-y-1.5">
              <p className="text-base font-semibold text-[#051a50]">
                {pending || cancelled
                  ? t("bankTransfer")
                  : t("visaEnding", { digits: orderDetailPlaceholders.cardLastFour })}
              </p>
              <p className="break-words text-xs leading-5 text-[#73798f]">
                {pending
                  ? t("notPaid", { refCode: order.refCode || "—" })
                  : cancelled
                    ? t("statuses.cancelled")
                    : t("chargedOn", {
                        amount: formatCurrency(order.total, order.currency),
                        date: orderDetailPlaceholders.chargedDate,
                      })}
              </p>
            </div>
          </div>
          {!pending && !cancelled ? (
            <div className="mt-2 flex flex-wrap items-center justify-end gap-x-4 gap-y-2 border-t border-[#dde2e8] pt-2 text-xs text-[#051a50] sm:justify-between sm:pl-16">
              <p>
                {t("invoiceNumber")}: #{orderDetailPlaceholders.invoiceNumber}
              </p>
              <Button
                disabled
                variant="ghost"
                className="h-auto gap-2 p-0 text-xs font-normal text-[#164990] disabled:opacity-100"
                title={t("invoiceDownloadUnavailable")}
              >
                <DocumentDownload size={18} aria-hidden="true" />
                {t("downloadInvoice")}
              </Button>
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
