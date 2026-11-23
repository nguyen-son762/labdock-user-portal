"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Link } from "@/i18n/navigation";

export function ProductLoginDialog({ children, requiresLogin }: { children: ReactNode; requiresLogin: boolean }) {
  const t = useTranslations("Product");
  const tAuth = useTranslations("Auth");

  if (!requiresLogin) return children;

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent hideClose>
        <DialogHeader>
          <DialogTitle>{t("loginRequiredTitle")}</DialogTitle>
          <DialogDescription>{t("loginRequiredDescription")}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              {t("continueBrowsing")}
            </Button>
          </DialogClose>
          <Button asChild variant="brand">
            <Link href="/login">{tAuth("logIn")}</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
