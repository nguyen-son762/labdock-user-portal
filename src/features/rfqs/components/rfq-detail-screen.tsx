"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/lib/api-error";

import { useRfqDetailQuery } from "../api/use-rfq-detail-query";
import { RfqItemsCard } from "./rfq-items-card";
import { RfqStatusBadge } from "./rfq-status-badge";

export function RfqDetailScreen({ rfqId }: { rfqId: string }) {
  const tErrors = useTranslations("ApiErrors");
  const t = useTranslations("Rfqs");
  const rfqQuery = useRfqDetailQuery(rfqId);
  const rfq = rfqQuery.data;

  return (
    <div className="mx-auto w-full max-w-[1440px] px-5 pb-12 pt-6 sm:px-10 xl:px-[100px]">
      <Breadcrumbs
        items={[
          { label: t("home"), href: "/" },
          { label: t("title"), href: "/rfqs" },
          { label: `#${rfq?.rfqNumber ?? rfqId}` },
        ]}
      />
      {rfqQuery.isPending ? (
        <div className="mt-4 space-y-4" aria-label={t("loading")} aria-busy="true">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-36 rounded-xl" />
        </div>
      ) : null}
      {rfqQuery.isError ? (
        <div className="mt-5 space-y-4">
          <Alert>{getApiErrorMessage(rfqQuery.error, tErrors)}</Alert>
          <Button asChild variant="outline">
            <Link href="/rfqs">{t("back")}</Link>
          </Button>
        </div>
      ) : null}
      {rfq ? (
        <div className="mt-3 space-y-5">
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-[32px] font-semibold leading-none text-[#0f3678] sm:text-[40px]">#{rfq.rfqNumber}</h1>
            <RfqStatusBadge status={rfq.status} />
          </div>

          <RfqItemsCard rfq={rfq} />

          <Card className="overflow-hidden border-[#dde2e8] !shadow-none">
            <h2 className="border-b border-[#dde2e8] px-5 py-4 text-xl font-semibold text-[#1f5fa8]">
              {t("inquiryMessage")}
            </h2>
            <p className="whitespace-pre-wrap break-words px-5 py-6 text-base leading-7 text-[#051a50]">
              {rfq.message ?? t("noMessage")}
            </p>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
