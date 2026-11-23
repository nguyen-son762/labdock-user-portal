import { Sms, TruckFast, Verify, Whatsapp } from "iconsax-reactjs";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

const footerColumns = [
  {
    titleKey: "productCategories",
    links: [
      { key: "chemicals", href: "/#chemicals-&-reagents" },
      { key: "consumables", href: "/#laboratory-consumables" },
      { key: "equipment", href: "/#laboratory-equipment" },
      { key: "housing", href: "/#animal-research-housing-systems" },
      { key: "biotechnology", href: "/#biotechnology-solutions" },
    ],
  },
  {
    titleKey: "customerSupport",
    links: [
      { key: "trackOrder", href: "/orders" },
      { key: "shipping", href: "/contact-us" },
      { key: "returns", href: "/contact-us" },
      { key: "consultation", href: "/contact-us" },
      { key: "contact", href: "/contact-us" },
    ],
  },
  {
    titleKey: "quickLinks",
    links: [
      { key: "terms", href: "/terms-and-conditions" },
      { key: "privacy", href: "/privacy" },
      { key: "warranty", href: "/terms-and-conditions" },
      { key: "about", href: "/about-us" },
      { key: "news", href: "/news" },
    ],
  },
] as const;

const certifications = ["S5G Certified", "CSBE Certified", "ISO Certified"] as const;

export function SiteFooter() {
  const t = useTranslations("Footer");
  const tPayments = useTranslations("PaymentMethods");

  return (
    <footer id="contact-us" className="border-t border-[#d9e4ee] bg-white text-[#5e6375]">
      <div className="container grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-[1.45fr_1fr_1fr_0.85fr_0.9fr]">
        <div>
          <Link
            href="/"
            aria-label="Labdock home"
            className="inline-flex items-center gap-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#164990]"
          >
            <Image
              src="/home/group_58.png"
              alt=""
              width={207}
              height={56}
              className="h-[56px] w-[207px] object-cover object-bottom"
            />
          </Link>
          <p className="mt-5 max-w-[260px] text-sm leading-6 text-[#051a50]">{t("tagline")}</p>
          <div className="mt-5 flex gap-4 text-[#73798f]">
            <Link
              href="#"
              aria-label="Labdock on Instagram"
              className="rounded hover:text-[#164990] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#164990]"
            >
              <Image src="/icon/x.svg" alt="Labdock on X" width={20} height={20} />
            </Link>
            <Link
              href="#"
              aria-label="Labdock website"
              className="rounded hover:text-[#164990] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#164990]"
            >
              <Image src="/icon/linkedin.svg" alt="Labdock on LinkedIn" width={20} height={20} />
            </Link>
            <Link
              href="#"
              aria-label="Labdock on Facebook"
              className="rounded hover:text-[#164990] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#164990]"
            >
              <Image src="/icon/facebook.svg" alt="Labdock on Facebook" width={20} height={20} />
            </Link>
          </div>
        </div>

        {footerColumns.map((column) => (
          <nav key={column.titleKey} aria-label={t(column.titleKey)}>
            <h2 className="text-sm font-semibold text-[#164990]">{t(column.titleKey)}</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {column.links.map((link) => (
                <li key={link.key}>
                  <Link href={link.href} className="hover:text-[#164990] hover:underline">
                    {link.key === "contact" ? t("contact") : t(`links.${link.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div>
          <h2 className="text-sm font-semibold text-[#164990]">{t("contact")}</h2>
          <address className="mt-4 space-y-3 text-sm not-italic">
            <a href="mailto:info@i-dna.sg" className="flex items-center gap-2 hover:text-[#164990]">
              <Sms className="size-4 text-[#164990]" variant="Bold" aria-hidden="true" /> info@i-dna.sg
            </a>
            <a href="tel:+6596221086" className="flex items-center gap-2 hover:text-[#164990]">
              <Whatsapp className="size-4 text-[#2bb673]" variant="Bold" aria-hidden="true" /> (+65) 96221086
            </a>
          </address>
          <p className="mt-8 text-sm font-semibold text-[#164990]">{t("payment")}</p>
          <div className="mt-3 flex gap-2" aria-label={tPayments("label")}>
            {[
              { image: "visa", label: tPayments("visa") },
              { image: "pay_now", label: tPayments("payNow") },
              { image: "pay", label: tPayments("mastercard") },
            ].map((payment) => (
              <Image
                key={payment.image}
                src={`/icon/${payment.image}.svg`}
                alt={payment.label}
                width={40}
                height={28}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-[#ecf0f3]">
        <div className="container flex flex-col gap-4 py-5 text-sm md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} LABDOCK. {t("rights")}
          </p>
          <div className="flex flex-wrap gap-4">
            {certifications.map((certification) => (
              <div key={certification} className="inline-flex items-center gap-1.5 text-[#303647]">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EFFAF3]">
                  <Verify className="size-5 text-[#3eb584]" variant="Bold" aria-hidden="true" />
                </div>{" "}
                {certification}
              </div>
            ))}
            <span className="inline-flex items-center gap-1.5 text-[#303647]">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D1ECFA]">
                <TruckFast className="size-5 text-[#164990]" variant="Bold" aria-hidden="true" />{" "}
              </div>
              {t("fastDelivery")}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
