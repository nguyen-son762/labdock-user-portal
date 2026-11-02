import { Bank } from "iconsax-reactjs";
import { useTranslations } from "next-intl";
import type { UseFormReturn } from "react-hook-form";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import type { CheckoutFormValues } from "../schemas/checkout.schema";

export function PaymentMethodSection({ form }: { form: UseFormReturn<CheckoutFormValues> }) {
  const t = useTranslations("Checkout");
  return (
    <section className="rounded-xl border border-[#dde2e8] bg-white p-4">
      <FormField
        control={form.control}
        name="paymentMethod"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-2xl font-semibold text-[#051a50]">{t("paymentMethod")}</FormLabel>
            <FormControl>
              <RadioGroup value={field.value} onValueChange={field.onChange} className="mt-5 gap-3">
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#ecf0f3] bg-[#f5f7f8] px-3 py-2.5">
                  <RadioGroupItem value="bank-transfer" aria-label={t("bankTransfer")} />
                  <span className="min-w-0 flex-1">
                    <strong className="block text-sm text-[#051a50]">{t("bankTransfer")}</strong>
                    <span className="block text-xs text-[#73798f]">{t("scanQr")}</span>
                  </span>
                  <Bank className="size-6 text-[#164990]" aria-hidden="true" />
                </label>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </section>
  );
}
