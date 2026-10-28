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
import { formatRfqDate } from "../utils/rfq-formatters";
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
          <Skeleton className="h-44 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
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
        <div className="mt-3 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[32px] font-semibold leading-none text-[#0f3678]">#{rfq.rfqNumber}</h1>
            <RfqStatusBadge status={rfq.status} />
          </div>

          <Card className="border-[#dde2e8] p-4 shadow-none sm:p-5">
            <dl className="grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <Info label={t("sourceLabel")} value={rfq.source} />
              <Info label={t("supplierId")} value={rfq.supplierId} mono />
              <Info label={t("createdLabel")} value={formatRfqDate(rfq.createdAt)} />
              <Info label={t("lastUpdatedLabel")} value={formatRfqDate(rfq.updatedAt)} />
              <Info label="RFQ ID" value={rfq.id} mono />
              <Info label={t("userId")} value={rfq.userId} mono />
            </dl>
          </Card>

          <RfqItemsCard rfq={rfq} />

          <div className="grid gap-4 md:grid-cols-3">
            <RemarkCard title={t("yourNotes")} value={rfq.notes} emptyText={t("noRemarks")} />
            <RemarkCard title={t("adminRemarks")} value={rfq.adminRemarks} emptyText={t("noRemarks")} />
            <RemarkCard title={t("supplierRemarks")} value={rfq.supplierRemarks} emptyText={t("noRemarks")} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Info({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-[#73798f]">{label}</dt>
      <dd className={mono ? "mt-1 break-all font-mono text-xs text-[#051a50]" : "mt-1 font-medium text-[#051a50]"}>
        {value}
      </dd>
    </div>
  );
}

function RemarkCard({ title, value, emptyText }: { title: string; value?: string | null; emptyText: string }) {
  return (
    <Card className="overflow-hidden border-[#dde2e8] shadow-none">
      <h2 className="border-b border-[#dde2e8] px-4 py-3 text-lg font-semibold text-[#1f5fa8]">{title}</h2>
      <p className="min-h-16 whitespace-pre-wrap break-words px-4 py-4 text-sm leading-6 text-[#051a50]">
        {value?.trim() || emptyText}
      </p>
    </Card>
  );
}
