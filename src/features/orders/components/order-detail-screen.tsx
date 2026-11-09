"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/lib/api-error";

import { useOrderDetailQuery } from "../api/use-order-detail-query";
import { OrderDetailContent } from "./order-detail-content";

export function OrderDetailScreen({ orderId }: { orderId: string }) {
  const tErrors = useTranslations("ApiErrors");
  const t = useTranslations("Orders");
  const orderQuery = useOrderDetailQuery(orderId, { refetchOnMount: "always" });

  return (
    <div className="bg-[#f9fcff]">
      <div className="mx-auto w-full max-w-[1440px] px-4 pb-12 pt-6 sm:px-10 xl:px-[100px]">
        <Breadcrumbs
          items={[
            { label: t("home"), href: "/" },
            { label: t("title"), href: "/orders" },
            { label: `#${orderQuery.data?.orderNumber ?? orderId}` },
          ]}
        />
        {orderQuery.isPending ? (
          <div className="mt-4 space-y-4" aria-label="Loading order details" aria-busy="true">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-44 rounded-xl" />
            <Skeleton className="h-72 rounded-xl" />
          </div>
        ) : null}
        {orderQuery.isError ? (
          <div className="mt-5 space-y-4">
            <Alert>{getApiErrorMessage(orderQuery.error, tErrors)}</Alert>
            <Button asChild variant="outline">
              <Link href="/orders">{t("backToOrders")}</Link>
            </Button>
          </div>
        ) : null}
        {orderQuery.data && !orderQuery.isError ? <OrderDetailContent order={orderQuery.data} /> : null}
      </div>
    </div>
  );
}
