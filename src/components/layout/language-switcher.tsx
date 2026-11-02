"use client";

import { ArrowDown2, TickCircle } from "iconsax-reactjs";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";

const localeFlags: Record<AppLocale, string> = { en: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", vi: "🇻🇳" };

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("Header");

  const changeLocale = (nextLocale: AppLocale) => {
    if (nextLocale !== locale) {
      router.replace(`${pathname}${window.location.search}${window.location.hash}`, { locale: nextLocale });
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          aria-label={t("language")}
          className="h-auto gap-1.5 rounded p-0 font-medium text-white hover:bg-transparent hover:text-white hover:opacity-80"
        >
          {locale === "vi" ? t("vietnamese") : t("english")}
          <ArrowDown2 className="size-3.5" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-44 rounded-xl border border-[#d5d7da] bg-white p-1.5 text-[#051a50] shadow-[0_12px_32px_rgba(5,26,80,0.16)]"
      >
        {routing.locales.map((option) => (
          <Button
            key={option}
            type="button"
            variant="ghost"
            onClick={() => changeLocale(option)}
            className="h-10 w-full justify-start rounded-lg px-3 font-medium hover:bg-[#f5f7f8]"
          >
            <span aria-hidden="true">{localeFlags[option]}</span>
            <span className="flex-1 text-left">{option === "vi" ? t("vietnamese") : t("english")}</span>
            {option === locale ? (
              <TickCircle className="size-4 text-[#2f7ac6]" variant="Bold" aria-hidden="true" />
            ) : null}
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
