import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ContactScreen } from "@/features/contact";
import { getLocalizedAlternates, getLocalizedPath, isAppLocale } from "@/i18n/locale";

type ContactUsPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: ContactUsPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isAppLocale(locale)) return {};
  const t = await getTranslations("RouteMetadata");
  const description = t("contactDescription");

  return {
    title: t("contact"),
    description,
    alternates: getLocalizedAlternates("/contact-us", locale),
    openGraph: {
      title: `${t("contact")} | Labdock`,
      description,
      url: getLocalizedPath("/contact-us", locale),
      locale: locale === "vi" ? "vi_VN" : "en_SG",
    },
  };
}

export default async function ContactUsPage() {
  return <ContactScreen initialType="general" />;
}
