import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCountryName } from "@/constants/country-options";

import type { CurrentUser } from "../schemas/user.schema";

function Detail({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <dt className="text-[13px] leading-[18px] text-[#73798f]">{label}</dt>
      <dd className="mt-1 break-words text-sm leading-5 text-[#051a50]">{value}</dd>
    </div>
  );
}

function SectionTitle({ children }: { children: string }) {
  return <h3 className="sm:col-span-2 text-base font-semibold text-[#1f5fa8]">{children}</h3>;
}

export function ProfileInfoPanel({ user, onEdit }: { user: CurrentUser; onEdit: () => void }) {
  const t = useTranslations("Profile");
  return (
    <Card className="overflow-hidden border-[#dde2e8] !shadow-none">
      <div className="flex h-12 items-center justify-between border-b border-[#dde2e8] px-4">
        <h2 className="text-lg font-semibold text-[#1f5fa8]">{t("accountInfo")}</h2>
        <Button type="button" variant="ghost" className="h-8 px-2 font-normal text-[#164990]" onClick={onEdit}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <g clip-path="url(#clip0_13323_4308)">
              <path
                d="M9.1665 3.3332H3.33317C2.89114 3.3332 2.46722 3.50879 2.15466 3.82135C1.8421 4.13391 1.6665 4.55784 1.6665 4.99986V16.6665C1.6665 17.1086 1.8421 17.5325 2.15466 17.845C2.46722 18.1576 2.89114 18.3332 3.33317 18.3332H14.9998C15.4419 18.3332 15.8658 18.1576 16.1783 17.845C16.4909 17.5325 16.6665 17.1086 16.6665 16.6665V10.8332M15.4165 2.0832C15.748 1.75168 16.1977 1.56543 16.6665 1.56543C17.1353 1.56543 17.585 1.75168 17.9165 2.0832C18.248 2.41472 18.4343 2.86436 18.4343 3.3332C18.4343 3.80204 18.248 4.25168 17.9165 4.5832L9.99984 12.4999L6.6665 13.3332L7.49984 9.99986L15.4165 2.0832Z"
                stroke="#164990"
                strokeWidth="1.67"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip0_13323_4308">
                <rect width="20" height="20" fill="white" />
              </clipPath>
            </defs>
          </svg>
          {t("edit")}
        </Button>
      </div>
      <dl className="grid gap-x-4 gap-y-5 p-4 sm:grid-cols-2 sm:p-6">
        <SectionTitle>{t("personalDetails")}</SectionTitle>
        <Detail label={t("fullName")} value={user.fullName} />
        <Detail label={t("phone")} value={user.phone} />
        <Detail label={t("email")} value={user.email} wide />

        <SectionTitle>{t("companyDetails")}</SectionTitle>
        <Detail label={t("companyName")} value={user.companyName} />
        <Detail label={t("companyPhone")} value={user.companyPhone} />
        <Detail label={t("businessRegistration")} value={user.businessRegistrationNumber} wide />

        <SectionTitle>{t("deliveryAddress")}</SectionTitle>
        <Detail label={t("address")} value={user.deliveryAddress} wide />
        <Detail label={t("postalCode")} value={user.postalCode} />
        <Detail label={t("country")} value={getCountryName(user.country)} />

        <SectionTitle>{t("billingAddress")}</SectionTitle>
        <Detail label="" value={user.billingSameAsDelivery ? t("sameAsDelivery") : t("differentBilling")} wide />
        {!user.billingSameAsDelivery ? (
          <>
            <Detail label={t("address")} value={user.billingAddress.address} wide />
            <Detail label={t("postalCode")} value={user.billingAddress.postalCode} />
            <Detail label={t("country")} value={getCountryName(user.billingAddress.country)} />
          </>
        ) : null}
      </dl>
    </Card>
  );
}
