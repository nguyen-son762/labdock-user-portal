"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/lib/api-error";

import { useOrderDetailQuery } from "../api/use-order-detail-query";
import { OrderInformationCards } from "./order-information-cards";
import { OrderItemsCard } from "./order-items-card";
import { OrderStatusBadge } from "./order-status-badge";

export function OrderDetailScreen({ orderId }: { orderId: string }) {
  const tErrors = useTranslations("ApiErrors");
  const t = useTranslations("Orders");
  const orderQuery = useOrderDetailQuery(orderId);

  return (
    <div className="mx-auto w-full max-w-[1440px] px-5 pb-12 pt-6 sm:px-10 xl:px-[100px]">
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
      {orderQuery.data ? (
        <div className="mt-3 space-y-4">
          <div className="flex items-center gap-3">
            <h1 className="text-[32px] font-semibold leading-none text-[#0f3678]">#{orderQuery.data.orderNumber}</h1>
            <OrderStatusBadge status={orderQuery.data.status} />
          </div>
          <OrderItemsCard order={orderQuery.data} />
          <OrderInformationCards order={orderQuery.data} />
        </div>
      ) : null}
    </div>
  );
}
