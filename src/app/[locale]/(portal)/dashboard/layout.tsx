import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { BrandMark } from "@/components/shared/brand-mark";
import { LogoutButton } from "@/features/auth";
import { Link } from "@/i18n/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Profile");
  return { title: t("dashboardTitle"), robots: { index: false, follow: false } };
}

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const t = await getTranslations("Profile");
  const navigation = [
    { href: "/dashboard", label: t("overview") },
    { href: "/dashboard/profile", label: t("title") },
  ];
  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b bg-card">
        <div className="container flex h-16 items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <BrandMark />
            <span className="font-semibold">{t("portal")}</span>
          </Link>
          <LogoutButton />
        </div>
      </header>
      <div className="container grid gap-8 py-8 md:grid-cols-[13rem_1fr]">
        <aside>
          <nav aria-label={t("dashboardNavigation")} className="flex gap-2 overflow-x-auto md:flex-col">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
