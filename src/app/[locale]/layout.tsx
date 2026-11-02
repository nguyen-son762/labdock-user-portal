import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { siteConfig } from "@/config/site";
import { AuthTokenRefreshSync } from "@/features/auth";
import { getLanguageAlternates, getLocalizedPath, isAppLocale } from "@/i18n/locale";
import { routing } from "@/i18n/routing";
import { AppProviders } from "@/providers/app-providers";

type LocaleLayoutProps = Readonly<{
  children: ReactNode;
  params: Promise<{ locale: string }>;
}>;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isAppLocale(locale)) return {};

  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: siteConfig.name,
      template: `%s · ${siteConfig.name}`,
    },
    description: t("siteDescription"),
    alternates: {
      canonical: getLocalizedPath("/", locale),
      languages: getLanguageAlternates("/"),
    },
    openGraph: {
      title: siteConfig.name,
      description: t("siteDescription"),
      type: "website",
      locale: locale === "vi" ? "vi_VN" : "en_SG",
      siteName: siteConfig.name,
      url: getLocalizedPath("/", locale),
    },
  };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <AppProviders>
        <AuthTokenRefreshSync />
        {children}
      </AppProviders>
    </NextIntlClientProvider>
  );
}
