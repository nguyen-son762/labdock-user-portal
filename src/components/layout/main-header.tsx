"use client";

import {
  ArrowDown2,
  Building,
  Call,
  Home,
  ProfileCircle,
  SearchNormal1,
  Shop,
  ShoppingCart,
  Sms,
} from "iconsax-reactjs";
import Image from "next/image";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/class-names";

import { CategoryPopover, type HeaderCategory } from "./category-popover";
import { LanguageSwitcher } from "./language-switcher";

const topLinks = [
  { key: "home", icon: Home, href: "/" },
  { key: "about", icon: Building, href: "/about-us" },
  { key: "contact", icon: Call, href: "/contact-us" },
] as const;

type HeaderAccount = { fullName: string; email: string };

type MainHeaderProps = {
  cartContent?: ReactNode;
  compactCartContent?: ReactNode;
  account?: HeaderAccount;
  isAuthenticated?: boolean;
  accountContent?: ReactNode;
  compactAccountContent?: ReactNode;
  categories?: readonly HeaderCategory[];
  categoriesLoading?: boolean;
  categoriesError?: boolean;
};

function AccountSummary({ account }: { account?: HeaderAccount }) {
  const t = useTranslations("Header");

  return (
    <Link
      href={account ? "/profile" : "/login"}
      className="flex h-9 w-[120px] shrink-0 items-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10">
        <ProfileCircle className="size-4" variant="Bold" aria-hidden="true" />
      </span>
      <span className="flex flex-col text-left leading-none">
        {account ? (
          <>
            <strong className="max-w-[76px] truncate text-[13px] leading-[17px]">{account.fullName}</strong>
            <span className="max-w-[76px] truncate text-xs font-normal leading-[18px]">{account.email}</span>
          </>
        ) : (
          <>
            <span className="text-[13px] leading-[17px]">{t("signIn")}</span>
            <strong className="text-sm leading-[18px]">{t("account")}</strong>
          </>
        )}
      </span>
    </Link>
  );
}

function OrderSummary() {
  const t = useTranslations("Header");

  return (
    <Link
      href="/cart"
      className="flex h-9 w-[114px] shrink-0 items-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
    >
      <span className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10">
        <ShoppingCart className="size-4" variant="Bold" aria-hidden="true" />
        <span
          aria-hidden="true"
          className="absolute -right-1 -top-0.5 flex size-4 items-center justify-center rounded-full bg-[#e57a00] text-[10px] font-semibold leading-none"
        >
          2
        </span>
      </span>
      <span className="flex flex-col text-left leading-none">
        <span className="text-[13px] leading-[17px]">{t("orders")}</span>
        <strong className="whitespace-nowrap text-sm leading-[18px]">S$200.00</strong>
      </span>
    </Link>
  );
}

function SearchBox({ className }: { className?: string }) {
  const t = useTranslations("Header");

  return (
    <div role="search" className={cn("flex h-11 items-center overflow-hidden bg-[#f5f7f8] pl-4 pr-1.5", className)}>
      <Input
        aria-label={t("searchCatalog")}
        placeholder={t("searchPlaceholder")}
        className="h-10 min-w-0 flex-1 border-0 bg-transparent px-0 text-sm text-[#051a50] shadow-none placeholder:text-[#a3abbd] focus-visible:ring-0! focus-visible:ring-offset-0 focus-visible:outline-none! focus-visible:shadow-none!"
      />
      <Button
        type="button"
        size="icon"
        variant="brand"
        aria-label={t("search")}
        className="size-8 shrink-0 p-0 shadow-[0_0_15px_rgba(229,122,0,0.5)]"
      >
        <SearchNormal1 className="size-4" aria-hidden="true" />
      </Button>
    </div>
  );
}

export function MainHeader({
  cartContent,
  compactCartContent,
  account,
  isAuthenticated = Boolean(account),
  accountContent,
  compactAccountContent,
  categories = [],
  categoriesLoading = false,
  categoriesError = false,
}: MainHeaderProps) {
  const pathname = usePathname();
  const t = useTranslations("Header");

  return (
    <header className="relative h-[110px] overflow-visible bg-[#16518f] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <Image src="/auth/header.png" alt="" fill priority sizes="100vw" className="object-cover" />
        <Image
          src="/auth/pattern.png"
          alt=""
          width={515}
          height={364}
          priority
          className="absolute right-0 top-0 h-[364px] w-[515px] max-w-none opacity-50 mix-blend-lighten"
        />
        <Image
          src="/auth/pattern.png"
          alt=""
          width={515}
          height={364}
          priority
          className="absolute left-0 top-1/2 h-[364px] w-[515px] max-w-none -translate-y-1/2 rotate-180 opacity-80 mix-blend-lighten"
        />
      </div>

      <div className="relative z-10 mx-auto h-full max-w-[1440px]">
        <div className="flex h-9 items-center justify-between border-b border-white/10 px-5 text-[13px] font-medium sm:px-10 xl:px-20">
          <nav aria-label={t("secondaryNavigation")} className="flex items-center gap-4 sm:gap-6">
            {topLinks.map(({ key, icon: Icon, href }) => (
              <Link
                key={key}
                href={href}
                aria-label={t(key)}
                className={cn(
                  "inline-flex h-5 items-center gap-2 transition-colors hover:text-[#f5a623]",
                  pathname === href && "text-[#f5a623]",
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                <span className={cn(key !== "home" && "hidden sm:inline")}>{t(key)}</span>
              </Link>
            ))}
          </nav>
          <div className="hidden h-5 items-center sm:flex">
            <a href="mailto:info@i-dna.sg" className="inline-flex items-center gap-1.5">
              <Sms className="size-3.5" variant="Bold" aria-hidden="true" />
              info@i-dna.sg
            </a>
            <span className="mx-5 h-5 w-px bg-white/20" aria-hidden="true" />
            <LanguageSwitcher />
            <Button
              type="button"
              variant="ghost"
              className="ml-5 h-auto gap-1.5 rounded p-0 font-medium text-white hover:bg-transparent hover:text-white hover:opacity-80"
            >
              <span aria-hidden="true">🇸🇬</span> SGD <ArrowDown2 className="size-3.5" aria-hidden="true" />
            </Button>
          </div>
        </div>

        <div className="flex h-[74px] items-center px-5 sm:px-10 xl:px-20">
          <Link
            href="/"
            aria-label="Labdock home"
            className="flex h-[50px] w-[185px] shrink-0 items-center gap-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <Image
              src="/auth/company-logo.png"
              alt=""
              width={56}
              height={50}
              className="h-[50px] w-[56px] object-cover object-bottom"
            />
            <Image
              src="/auth/labdock-wordmark.svg"
              alt="Labdock"
              width={121}
              height={30}
              className="h-[30px] w-[121px]"
            />
          </Link>

          <div className="ml-[71px] hidden h-11 w-[485px] shrink-0 items-stretch gap-px min-[1380px]:flex">
            <CategoryPopover categories={categories} isLoading={categoriesLoading} hasError={categoriesError} />
            <SearchBox className="w-[350px] rounded-r-full" />
          </div>

          <Button
            variant="brand"
            className="ml-auto hidden h-11 shrink-0 justify-start rounded-full py-1.5 pl-1.5 pr-4 shadow-[0_0_25px_rgba(239,163,59,0.3)] min-[1380px]:flex"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#efa33b] shadow-[0_0_15px_rgba(229,122,0,0.5)]">
              <Shop className="size-4" aria-hidden="true" />
            </span>
            <span className="flex flex-col items-start gap-px text-left leading-none">
              <strong className="text-[13px] leading-[16px]">{t("sell")}</strong>
              <span className="text-xs font-normal leading-[15px]">{t("partner")}</span>
            </span>
          </Button>

          <div className="ml-2.5 hidden items-center gap-2 min-[1380px]:flex">
            {accountContent ?? <AccountSummary account={account} />}
            {isAuthenticated ? (cartContent ?? <OrderSummary />) : null}
          </div>

          <div className="ml-auto flex min-w-0 items-center gap-2 min-[1380px]:hidden">
            <SearchBox className="hidden w-[min(42vw,420px)] rounded-full lg:flex" />
            <CategoryPopover categories={categories} compact isLoading={categoriesLoading} hasError={categoriesError} />
            {compactAccountContent ?? (
              <Link
                href={account ? "/profile" : "/login"}
                aria-label={account ? t("profile") : t("signIn")}
                className="flex size-10 items-center justify-center rounded-full bg-white/10"
              >
                <ProfileCircle className="size-5" variant="Bold" aria-hidden="true" />
              </Link>
            )}
            {isAuthenticated
              ? (compactCartContent ?? (
                  <Link
                    href="/cart"
                    aria-label={t("cart")}
                    className="relative flex size-10 items-center justify-center rounded-full bg-white/10"
                  >
                    <ShoppingCart className="size-5" variant="Bold" aria-hidden="true" />
                  </Link>
                ))
              : null}
          </div>
        </div>
      </div>
    </header>
  );
}
