import type { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";

import { CountrySelect } from "@/components/shared/country-select";
import { getCountryCallingCode } from "@/constants/country-options";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { getNationalPhone } from "../utils/national-phone";
import type { CheckoutFormValues } from "../schemas/checkout.schema";
import { CountryCallingCodePicker } from "./country-calling-code-picker";

type CheckoutForm = UseFormReturn<CheckoutFormValues>;
type AddressField = "fullName" | "email" | "phone" | "companyName" | "address" | "city" | "postalCode" | "country";
type StringFieldName = {
  [Key in keyof CheckoutFormValues]-?: NonNullable<CheckoutFormValues[Key]> extends string ? Key : never;
}[keyof CheckoutFormValues];

export type AddressFieldNames = Record<AddressField, StringFieldName>;

export const deliveryFieldNames: AddressFieldNames = {
  fullName: "fullName",
  email: "email",
  phone: "phone",
  companyName: "companyName",
  address: "address",
  city: "city",
  postalCode: "postalCode",
  country: "country",
};

export const billingFieldNames: AddressFieldNames = {
  fullName: "billingFullName",
  email: "billingEmail",
  phone: "billingPhone",
  companyName: "billingCompanyName",
  address: "billingAddress",
  city: "billingCity",
  postalCode: "billingPostalCode",
  country: "billingCountry",
};

function RequiredMark() {
  return <span className="text-destructive">*</span>;
}

/** Contact and address inputs shared by the delivery and billing sections. */
export function AddressFieldGroup({
  form,
  names,
  autoCompleteSection,
  postalCodeRequired = false,
}: {
  form: CheckoutForm;
  names: AddressFieldNames;
  autoCompleteSection?: "billing";
  postalCodeRequired?: boolean;
}) {
  const t = useTranslations("Checkout");
  const country = form.watch(names.country) ?? "";
  const callingCode = getCountryCallingCode(country);
  const autoComplete = (token: string) => (autoCompleteSection ? `${autoCompleteSection} ${token}` : token);
  const changeCountry = (nextCountry: string) => {
    const previousCallingCode = getCountryCallingCode(form.getValues(names.country) ?? "");
    const nextCallingCode = getCountryCallingCode(nextCountry);
    const nationalNumber = getNationalPhone(form.getValues(names.phone) ?? "", previousCallingCode);

    form.setValue(names.country, nextCountry, { shouldDirty: true, shouldValidate: true });
    form.setValue(names.phone, [nextCallingCode, nationalNumber].filter(Boolean).join(" "), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <>
      <FormField
        control={form.control}
        name={names.fullName}
        render={({ field }) => (
          <FormItem className="sm:col-span-2">
            <FormLabel>{t("fullName")} *</FormLabel>
            <FormControl>
              <Input autoComplete={autoComplete("name")} {...field} value={field.value ?? ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={names.email}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t("emailAddress")} <RequiredMark />
            </FormLabel>
            <FormControl>
              <Input type="email" autoComplete={autoComplete("email")} {...field} value={field.value ?? ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={names.phone}
        render={({ field }) => (
          <FormItem className="min-w-0">
            <FormLabel>
              {t("phoneNumber")} <RequiredMark />
            </FormLabel>
            <div className="flex h-11 min-w-0 overflow-hidden rounded-md border border-input shadow-sm transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
              <CountryCallingCodePicker value={country} onChange={changeCountry} />
              <FormControl>
                <Input
                  name={field.name}
                  ref={field.ref}
                  inputMode="tel"
                  autoComplete={autoComplete("tel-national")}
                  value={getNationalPhone(field.value ?? "", callingCode)}
                  onBlur={field.onBlur}
                  onChange={(event) => {
                    const nationalNumber = event.currentTarget.value;
                    field.onChange([callingCode, nationalNumber].filter(Boolean).join(" "));
                  }}
                  className="h-full w-0 min-w-0 flex-1 rounded-none border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </FormControl>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={names.companyName}
        render={({ field }) => (
          <FormItem className="sm:col-span-2">
            <FormLabel>{t("company")}</FormLabel>
            <FormControl>
              <Input autoComplete={autoComplete("organization")} {...field} value={field.value ?? ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={names.address}
        render={({ field }) => (
          <FormItem className="sm:col-span-2">
            <FormLabel>
              {t("address")} <RequiredMark />
            </FormLabel>
            <FormControl>
              <Input autoComplete={autoComplete("street-address")} {...field} value={field.value ?? ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={names.city}
        render={({ field }) => (
          <FormItem className="sm:col-span-2">
            <FormLabel>{t("city")} *</FormLabel>
            <FormControl>
              <Input autoComplete={autoComplete("address-level2")} {...field} value={field.value ?? ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={names.postalCode}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t("postalCode")}
              {postalCodeRequired ? " *" : null}
            </FormLabel>
            <FormControl>
              <Input
                inputMode={postalCodeRequired ? "numeric" : undefined}
                autoComplete={autoComplete("postal-code")}
                {...field}
                value={field.value ?? ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={names.country}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t("country")} <RequiredMark />
            </FormLabel>
            <FormControl>
              <CountrySelect
                {...field}
                value={field.value ?? ""}
                onValueChange={changeCountry}
                placeholder={t("selectCountry")}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

export function DeliveryAddressFields({ form }: { form: CheckoutForm }) {
  const t = useTranslations("Checkout");

  return (
    <section className="rounded-xl border border-[#dde2e8] bg-white p-4" aria-labelledby="delivery-address-title">
      <h2 id="delivery-address-title" className="text-2xl font-semibold text-[#051a50]">
        {t("deliveryAddress")}
      </h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <AddressFieldGroup form={form} names={deliveryFieldNames} />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>{t("notes")}</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </section>
  );
}
