import { ArrowRight2 } from "iconsax-reactjs";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/class-names";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  appearance?: "current-primary" | "parent-primary";
};

export function Breadcrumbs({ items, appearance = "current-primary" }: BreadcrumbsProps) {
  const t = useTranslations("Header");
  return (
    <nav aria-label={t("breadcrumb")} className="flex flex-wrap items-center gap-2 text-sm text-[#164990] font-medium">
      {items.map((item, index) => (
        <span key={item.label} className="inline-flex items-center gap-2">
          {index > 0 ? <ArrowRight2 className="size-3.5 text-[#a3abbd]" aria-hidden="true" /> : null}
          {item.href ? (
            <Link
              href={item.href}
              className={cn(
                "rounded hover:text-[#164990] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#164990]",
                appearance === "parent-primary" && "text-[#868DA5]",
              )}
            >
              {item.label}
            </Link>
          ) : (
            <span aria-current="page" className={appearance !== "parent-primary" ? "text-[#868DA5]" : "text-[#164990]"}>
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
