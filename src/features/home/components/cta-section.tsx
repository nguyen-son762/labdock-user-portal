import { ArrowRight } from "iconsax-reactjs";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

const cards = [
  {
    key: "equipment",
    image: "/home/cta-equipment-figma.png",
    background: "linear-gradient(270deg, #0F3678 0%, #2F7BC4 100%)",
    href: "#new-products",
    buttonVariant: "brand",
    patternClassName: "left-0",
  },
  {
    key: "partner",
    image: "/home/cta-partner-figma.png",
    background: "linear-gradient(90deg, #E57A00 0%, #EFA33B 100%)",
    href: "/contact-us",
    buttonVariant: "default",
    patternClassName: "right-0",
  },
] as const;

export function CtaSection() {
  const t = useTranslations("Home");

  return (
    <section className="bg-[#f5f8fb] py-16" aria-label={t("opportunitiesLabel")}>
      <div className="container grid gap-6 lg:grid-cols-2">
        {cards.map((card) => (
          <article key={card.key} className="relative isolate h-[300px] rounded-[20px]">
            <div
              className="absolute inset-0 z-0 overflow-hidden rounded-[20px]"
              style={{ background: card.background }}
            >
              <Image
                src="/home/cta-pattern-figma.png"
                alt=""
                width={515}
                height={364}
                aria-hidden="true"
                className={`pointer-events-none absolute top-0 left-0 h-[364px] w-[515px] max-w-none opacity-80 mix-blend-lighten ${card.patternClassName}`}
              />
            </div>
            <div className="absolute right-0 bottom-0 z-10 h-[336px] w-[310px] max-w-[55%]">
              <Image
                src={card.image}
                alt=""
                fill
                sizes="310px"
                className="rounded-[20px] object-contain object-right-top"
                unoptimized
              />
            </div>
            <div className="relative z-20 flex h-full max-w-full flex-col items-start justify-end px-6 py-8 text-white">
              <div className="flex w-full flex-col items-start gap-2 self-stretch pb-6">
                <h2 className="text-2xl font-semibold leading-tight">{t(`cta.${card.key}.title`)}</h2>
                <p className="text-sm leading-5 text-white/90">{t(`cta.${card.key}.description`)}</p>
              </div>
              <Button
                asChild
                variant={card.buttonVariant}
                className={`h-10 w-fit gap-4 rounded-full p-1.5 pl-5 ${
                  card.key === "partner"
                    ? "shadow-[0_0_50px_rgba(47,123,196,0.3)]"
                    : "shadow-[0_0_50px_rgba(239,163,59,0.3)]"
                }`}
              >
                <Link href={card.href}>
                  {t(`cta.${card.key}.action`)}
                  <span className="flex size-7 items-center justify-center rounded-full bg-white/10">
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </span>
                </Link>
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
