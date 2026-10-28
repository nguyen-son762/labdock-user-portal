import Image from "next/image";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";

export function SuppliersComingSoonScreen() {
  const t = useTranslations("Suppliers");

  return (
    <section className="bg-muted/30 px-5 py-16 sm:py-24" aria-labelledby="suppliers-title">
      <Card className="mx-auto flex max-w-2xl flex-col items-center px-6 py-12 text-center sm:px-12">
        <div className="flex size-24 items-center justify-center rounded-full bg-accent">
          <Image src="/home/icon/group.svg" alt="" width={64} height={64} />
        </div>
        <p className="mt-6 text-sm font-semibold text-primary">{t("title")}</p>
        <h1 id="suppliers-title" className="mt-3 text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
          {t("comingSoon")}
        </h1>
        <p className="mt-4 max-w-md text-base leading-7 text-muted-foreground">{t("description")}</p>
        <div className="mt-8 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
          <Button asChild>
            <Link href="/products">{t("browseProducts")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">{t("backHome")}</Link>
          </Button>
        </div>
      </Card>
    </section>
  );
}
