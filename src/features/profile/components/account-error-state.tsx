"use client";

import axios from "axios";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api-error";

export function AccountErrorState({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  const tErrors = useTranslations("ApiErrors");
  const t = useTranslations("Profile");
  const isUnauthenticated = axios.isAxiosError(error) && error.response?.status === 401;

  return (
    <div className="mx-auto max-w-xl space-y-4 py-10">
      <Alert>{getApiErrorMessage(error, tErrors)}</Alert>
      <div className="flex gap-3">
        {isUnauthenticated ? (
          <Button asChild>
            <Link href="/login">{t("loginAgain")}</Link>
          </Button>
        ) : (
          <Button onClick={onRetry}>{t("retry")}</Button>
        )}
        <Button asChild variant="outline">
          <Link href="/">{t("backHome")}</Link>
        </Button>
      </div>
    </div>
  );
}
