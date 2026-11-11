"use client";

import { Logout, ProfileCircle } from "iconsax-reactjs";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Link, useRouter } from "@/i18n/navigation";

import { useLogoutMutation } from "../api/use-logout-mutation";

type HeaderAccountMenuProps = {
  account: {
    fullName: string;
    email: string;
  };
  compact?: boolean;
};

export function HeaderAccountMenu({ account, compact = false }: HeaderAccountMenuProps) {
  const [open, setOpen] = useState(false);
  const logoutMutation = useLogoutMutation();
  const router = useRouter();
  const t = useTranslations("Header");

  async function handleLogout(): Promise<void> {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      setOpen(false);
      router.replace("/login");
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          aria-label={t("accountMenu")}
          className={
            compact
              ? "size-10 rounded-full bg-white/10 p-0 text-white hover:bg-white/15 hover:text-white focus-visible:ring-white"
              : "h-10 w-[132px] shrink-0 justify-start gap-2 rounded-full p-0 pr-1 font-normal text-white transition-[height,padding,background-color] duration-200 hover:h-12 hover:px-1 hover:py-1 hover:bg-white/10 hover:text-white focus-visible:ring-white"
          }
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10">
            <ProfileCircle className={compact ? "size-5" : "size-4"} variant="Bold" aria-hidden="true" />
          </span>
          {!compact ? (
            <>
              <span className="min-w-0 flex-1 text-left leading-none">
                <strong className="block truncate text-[13px] leading-[17px]">{account.fullName}</strong>
                <span className="block truncate text-xs font-normal leading-[18px]">{account.email}</span>
              </span>
            </>
          ) : null}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={10}
        aria-label={t("accountMenu")}
        className="w-60 rounded-xl border border-[#dde2e8] bg-white p-2 text-[#051a50] shadow-[0_16px_40px_rgba(5,26,80,0.18)]"
      >
        <div className="border-b border-[#edf0f2] px-3 py-2.5">
          <p className="truncate text-sm font-semibold">{account.fullName}</p>
          <p className="mt-1 truncate text-xs text-[#73798f]">{account.email}</p>
        </div>
        <div className="pt-1.5">
          <Button asChild variant="ghost" className="h-10 w-full justify-start rounded-lg px-3 font-medium">
            <Link href="/profile" onClick={() => setOpen(false)}>
              <ProfileCircle className="size-4" aria-hidden="true" />
              {t("profile")}
            </Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={logoutMutation.isPending}
            onClick={() => void handleLogout()}
            className="h-10 w-full justify-start rounded-lg px-3 font-medium text-[#d92d20] hover:bg-[#fef3f2] hover:text-[#d92d20]"
          >
            <Logout className="size-4" aria-hidden="true" />
            {logoutMutation.isPending ? t("loggingOut") : t("logout")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
