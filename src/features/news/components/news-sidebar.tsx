import { ArrowRight } from "iconsax-reactjs";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export function NewsSidebar() {
  const t = useTranslations("News");
  return (
    <aside className="space-y-4">
      <section className="relative isolate overflow-hidden rounded-xl px-3 py-6 text-center text-white">
        <Image src="/news/research-cta.png" alt="" fill sizes="404px" className="-z-10 object-cover" />
        <h2 className="mx-auto max-w-[340px] text-2xl font-semibold leading-8">{t("researchInstitutions")}</h2>
        <Button asChild variant="brand" className="mt-4 h-14 pl-[18px] pr-1.5 text-base font-normal">
          <Link href="/products">
            {t("exploreProducts")}
            <span className="flex size-11 items-center justify-center rounded-full bg-[#efa33b]">
              <ArrowRight className="size-6" aria-hidden="true" />
            </span>
          </Link>
        </Button>
      </section>
    </aside>
  );
}
