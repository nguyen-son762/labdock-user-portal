import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { SuppliersComingSoonScreen } from "@/features/suppliers";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Suppliers");

  return {
    title: `${t("title")} — ${t("comingSoon")}`,
    description: t("description"),
    robots: { index: false, follow: true },
  };
}

export default function SuppliersPage() {
  return <SuppliersComingSoonScreen />;
}
