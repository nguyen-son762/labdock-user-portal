import Image from "next/image";
import { useTranslations } from "next-intl";

import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { cn } from "@/lib/class-names";

import type { LegalDocument } from "../legal.types";

export function LegalHero({ document }: { document: LegalDocument }) {
  const t = useTranslations("Header");
  return (
    <section
      className={cn(
        "relative flex items-center justify-center overflow-hidden px-5 text-center",
        document.kind === "terms" ? "h-[141px]" : "h-[145px]",
      )}
      aria-labelledby="legal-page-title"
    >
      <Image src="/legal/legal-hero.png" alt="" fill priority sizes="100vw" className="object-cover object-center" />
      <div className={cn("relative flex flex-col items-center", document.kind === "terms" ? "gap-3" : "gap-4")}>
        <Breadcrumbs items={[{ label: t("home"), href: "/" }, { label: document.title }]} />
        <h1 id="legal-page-title" className="text-[32px] font-semibold leading-none text-[#0f3678]">
          {document.title}
        </h1>
      </div>
    </section>
  );
}
