"use client";

import { useTranslations } from "next-intl";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function NewsError({ reset }: { reset: () => void }) {
  const t = useTranslations("News");
  return (
    <div className="container space-y-4 py-10">
      <Alert>{t("loadError")}</Alert>
      <Button onClick={reset} variant="outline">
        {t("retry")}
      </Button>
    </div>
  );
}
