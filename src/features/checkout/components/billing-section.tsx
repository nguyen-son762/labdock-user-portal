import type { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";

import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";

import type { CheckoutFormValues } from "../schemas/checkout.schema";
import { AddressFieldGroup, billingFieldNames, deliveryFieldNames } from "./address-fields";

const prefilledContactFields = ["fullName", "email", "phone", "companyName", "city", "country"] as const;

export function BillingSection({ form }: { form: UseFormReturn<CheckoutFormValues> }) {
  const t = useTranslations("Checkout");
  const sameAsDelivery = form.watch("billingSameAsDelivery");

  // When switching to a separate billing address, start empty billing contact fields from the delivery values.
  function prefillBillingContact() {
    for (const key of prefilledContactFields) {
      const billingName = billingFieldNames[key];
      if (form.getValues(billingName)) continue;
      form.setValue(billingName, form.getValues(deliveryFieldNames[key]) ?? "", { shouldDirty: true });
    }
  }

  return (
    <section className="rounded-xl border border-[#dde2e8] bg-white p-4" aria-labelledby="billing-address-title">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 id="billing-address-title" className="text-2xl font-semibold text-[#051a50]">
          {t("billingAddress")}
        </h2>
        <FormField
          control={form.control}
          name="billingSameAsDelivery"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    if (checked !== true) prefillBillingContact();
                    field.onChange(checked === true);
                  }}
                />
              </FormControl>
              <FormLabel className="cursor-pointer font-normal">{t("sameAsDelivery")}</FormLabel>
            </FormItem>
          )}
        />
      </div>
      {!sameAsDelivery ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <AddressFieldGroup form={form} names={billingFieldNames} autoCompleteSection="billing" postalCodeRequired />
        </div>
      ) : null}
    </section>
  );
}
