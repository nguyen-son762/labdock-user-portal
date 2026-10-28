import {
  ArrowRight,
  Box,
  Calendar,
  ClipboardText,
  Location,
  MessageText,
  MoneyChange,
  People,
  ReceiptItem,
  ShoppingCart,
  TruckFast,
  Verify,
} from "iconsax-reactjs";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/class-names";

import type { HomeBanner } from "../home.types";

const guarantees = [
  { key: "verified", icon: Verify, color: "bg-[#dff5eb] text-[#3eb584]" },
  { key: "certified", icon: Verify, color: "bg-[#dff5eb] text-[#3eb584]" },
  { key: "delivery", icon: TruckFast, color: "bg-[#dceeff] text-[#164990]" },
  { key: "pricing", icon: MoneyChange, color: "bg-[#fff0d2] text-[#e57a00]" },
] as const;

const quickActions = [
  { key: "product", icon: Box, href: "/products", imageUrl: "/home/icon/lab_1.svg" },
  { key: "suppliers", icon: People, href: "/suppliers", imageUrl: "/home/icon/group.svg" },
  { key: "rfq", icon: ClipboardText, href: "/rfqs", imageUrl: "/home/icon/invoice.svg" },
  { key: "orders", icon: ShoppingCart, href: "/orders", imageUrl: "/home/icon/shopping-cart.svg" },
  { key: "chat", icon: MessageText, href: "/contact-us", imageUrl: "/home/icon/chat-box.svg" },
  { key: "news", icon: ReceiptItem, href: "/news", imageUrl: "/home/icon/annotation.svg" },
] as const;

function PromoCard({ event = false }: { event?: boolean }) {
  const t = useTranslations("Home");

  return (
    <article className="relative min-h-[250px] overflow-hidden rounded-xl text-white lg:min-h-[300px]">
      <Image
        src={event ? "/home/event-promo.png" : "/home/hero-promo.png"}
        alt=""
        fill
        sizes={event ? "(min-width: 1024px) 33vw, 100vw" : "(min-width: 1024px) 66vw, 100vw"}
        className="object-cover"
      />
      <div className="absolute inset-0  " />
      <div className="relative flex h-full min-h-[250px] max-w-lg flex-col justify-end p-6 lg:min-h-[300px]">
        <span className="mb-2 w-fit rounded bg-[#a24e00] px-1.5 py-0.5 text-[10px] font-semibold uppercase">
          {event ? t("upcomingEvent") : t("lowStock")}
        </span>
        <h2 className="max-w-md text-xl font-semibold leading-tight lg:text-2xl">
          {event ? t("eventPromo") : t("chemicalPromo")}
        </h2>
        {event ? (
          <p className="mt-3 flex flex-wrap gap-4 text-xs text-white/90">
            <span className="inline-flex items-center gap-1.5">
              <Location className="size-3.5" variant="Bold" aria-hidden="true" /> Singapore
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-3.5" variant="Bold" aria-hidden="true" /> 6 Jun 2026
            </span>
          </p>
        ) : null}
        <Button asChild variant={event ? "default" : "brand"} className="mt-5 h-11 w-fit rounded-full px-5">
          <Link href={event ? "/contact-us" : "#new-products"}>
            {event ? t("register") : t("shopCollection")}
            <span className="flex size-7 items-center justify-center rounded-full bg-white/10">
              <ArrowRight className="size-4" aria-hidden="true" />
            </span>
          </Link>
        </Button>
      </div>
    </article>
  );
}

function BannerAction({ href, children, className }: { href: string; children: ReactNode; className: string }) {
  const destination = href.trim();
  if (/[\u0000-\u0020\\]/.test(destination)) return null;
  const isExternal = /^https?:\/\//i.test(destination);
  if (!isExternal && !/^\/(?!\/)|^#/.test(destination)) return null;
  if (isExternal) {
    return (
      <a href={destination} target="_blank" rel="noreferrer" className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link href={destination} className={className}>
      {children}
    </Link>
  );
}

function HomepageBannerCard({ banner }: { banner: HomeBanner }) {
  const locale = useLocale();
  const isLeft = banner.type === "Left";
  const formattedDate = banner.dateTime
    ? new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(
        new Date(banner.dateTime),
      )
    : null;
  const hasMetadata = Boolean(banner.location || formattedDate);
  const hasContent = Boolean(
    banner.badge || banner.title || (banner.showDescription && banner.description) || hasMetadata || banner.buttonLabel,
  );

  return (
    <article
      className={cn(
        "group relative min-h-[250px] overflow-hidden rounded-xl text-white shadow-[0_0_10px_rgba(255,255,255,0.5)] lg:min-h-[300px]",
        isLeft ? "lg:col-span-2" : "lg:col-span-1",
      )}
    >
      <Image
        src={banner.imageUrl}
        alt=""
        fill
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
      />
      <div className="pointer-events-none absolute inset-px rounded-[10px] bg-[linear-gradient(90deg,rgba(8,38,95,0.72)_0%,rgba(8,38,95,0.2)_55%,rgba(8,38,95,0)_100%)]" />
      <div className="pointer-events-none absolute inset-0 rounded-xl border-2 border-white" />
      {hasContent ? (
        <div className="absolute inset-x-0 bottom-0 p-6">
          {banner.badge ? (
            <span
              className={cn(
                "mb-2 inline-flex rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                isLeft ? "bg-[#a24e00]" : "bg-[#2263a0]",
              )}
            >
              {banner.badge}
            </span>
          ) : null}
          {banner.title ? (
            <h2
              className={cn(
                "text-xl font-semibold leading-tight lg:text-2xl lg:leading-8",
                isLeft ? "max-w-[384px]" : "max-w-xl",
              )}
            >
              {banner.title}
            </h2>
          ) : null}
          {banner.showDescription && banner.description ? (
            <p className="mt-2 max-w-xl text-sm leading-5 text-white/90">{banner.description}</p>
          ) : null}
          {hasMetadata ? (
            <p className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/90">
              {banner.location ? (
                <span className="inline-flex items-center gap-1.5 text-[13px]">
                  <Location className="size-[14px]" variant="Bold" aria-hidden="true" />
                  {banner.location}
                </span>
              ) : null}
              {formattedDate ? (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="size-3.5" variant="Bold" aria-hidden="true" />
                  {formattedDate}
                </span>
              ) : null}
            </p>
          ) : null}
          {banner.buttonLabel && banner.linkUrl ? (
            <BannerAction
              href={banner.linkUrl}
              className={cn(
                buttonVariants({ variant: isLeft ? "brand" : "default" }),
                "mt-5 h-11 w-fit rounded-full p-[6px] pl-5 shadow-none",
              )}
            >
              {banner.buttonLabel}
              <span className="flex size-7 items-center justify-center rounded-full bg-white/10">
                <ArrowRight className="size-4" aria-hidden="true" />
              </span>
            </BannerAction>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export function HeroSection({ banners }: { banners: readonly HomeBanner[] }) {
  const t = useTranslations("Home");

  return (
    <section className="relative overflow-hidden pb-[70px]" aria-labelledby="home-hero-title">
      <div className="container relative pt-12">
        <div className="max-w-[820px]">
          <h1
            id="home-hero-title"
            className="max-w-[433px] text-xl font-semibold leading-[1.12] text-[#051a50] lg:text-[32px] lg:leading-[42px]"
          >
            {t("heroTitle")}
          </h1>
          <p
            className="mt-4 max-w-[452px] text-base leading-6 text-[#5e6375]"
            dangerouslySetInnerHTML={{
              __html: t("heroDescription"),
            }}
          ></p>
          <ul
            className="mt-6 inline-flex max-w-full flex-wrap items-center gap-2 rounded-[28px] bg-white p-1.5 shadow-[0_6px_24px_rgba(5,26,80,0.04)]"
            aria-label="Procurement guarantees"
          >
            {guarantees.map(({ key, icon: Icon, color }) => (
              <li key={key} className="flex items-center pr-3 gap-2 whitespace-nowrap text-sm text-[#1A1A1A]">
                <span className={`flex size-8 shrink-0 items-center justify-center rounded-full ${color}`}>
                  <Icon className="size-4" variant="Bold" aria-hidden="true" />
                </span>
                {t(`guarantees.${key}`)}
              </li>
            ))}
          </ul>
        </div>

        {banners.length ? (
          <div className={cn("mt-11 grid gap-5", banners.length > 1 ? "lg:grid-cols-3" : "lg:grid-cols-1")}>
            {banners.map((banner) => (
              <HomepageBannerCard key={banner.id} banner={banner} />
            ))}
          </div>
        ) : (
          <div className="mt-11 grid gap-5 lg:grid-cols-[2fr_1fr]">
            <PromoCard />
            <PromoCard event />
          </div>
        )}

        <nav aria-label="Quick actions" className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {quickActions.map(({ key, href, imageUrl }) => (
            <Link
              key={key}
              href={href}
              className="flex h-[72px] items-center justify-center gap-3 rounded-xl bg-white/90 px-4 font-semibold text-[#22293b] shadow-[0_8px_30px_rgba(5,26,80,0.05)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#164990]"
            >
              <Image src={imageUrl} alt="" width={40} height={40} />
              {t(`quickActions.${key}`)}
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
