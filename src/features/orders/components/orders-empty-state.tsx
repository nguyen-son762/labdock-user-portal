import { BoxSearch } from "iconsax-reactjs";
import { useTranslations } from "next-intl";

export function OrdersEmptyState({ isFiltered = false }: { isFiltered?: boolean }) {
  const t = useTranslations("Orders");
  return (
    <section className="rounded-xl border border-dashed border-[#c8d0d9] bg-white px-5 py-16 text-center">
      <BoxSearch className="mx-auto size-10 text-[#73798f]" aria-hidden="true" />
      <h2 className="mt-4 text-lg font-semibold text-[#0f3678]">
        {isFiltered ? t("filteredEmptyTitle") : t("emptyTitle")}
      </h2>
      <p className="mt-1 text-sm text-[#73798f]">
        {isFiltered ? t("filteredEmptyDescription") : t("emptyDescription")}
      </p>
    </section>
  );
}
