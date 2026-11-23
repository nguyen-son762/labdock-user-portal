import { ArrowRight, DocumentText, Verify } from "iconsax-reactjs";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export function QuoteCard() {
  const t = useTranslations("Product");
  return (
    <aside className="relative col-span-2 sm:col-start-2 xl:col-start-4 min-h-[382px] overflow-hidden rounded-lg bg-gradient-to-br from-[#174d91] to-[#72b1de] p-5 text-white">
      <Image
        src="/home/editorial-equipment.png"
        alt={t("laboratoryEquipment")}
        fill
        unoptimized
        sizes="400px"
        className="object-cover opacity-25"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#123f82]/95 via-[#174d91]/85 to-[#2f7bc4]/40" />
      <div className="relative flex h-full flex-col justify-center">
        <DocumentText className="size-9 text-[#f3a132]" variant="Bulk" aria-hidden="true" />
        <h2 className="mt-4 text-2xl font-semibold">{t("quoteTitle")}</h2>
        <p className="mt-2 max-w-[270px] text-sm text-white/85">{t("quoteCardDescription")}</p>
        <Button asChild variant="brand" className="mt-6 w-fit px-5 shadow-none">
          <Link href="/contact-us?type=quote">
            {t("quoteAction")} <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
        <div className="mt-6 flex flex-wrap gap-2 text-[10px]">
          {[t("isoCertified"), t("coaAvailable")].map((label) => (
            <span key={label} className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1">
              <Verify className="size-3 text-[#85d5bb]" variant="Bold" aria-hidden="true" /> {label}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
}
