"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@/i18n/navigation";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";

import { CountrySelect } from "@/components/shared/country-select";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { createQuoteContactSchema, type QuoteContactValues } from "../schemas/quote.schema";

type QuoteContactFormProps = {
  onSubmit: (values: QuoteContactValues) => void;
  pending: boolean;
  error?: string;
};

export function QuoteContactForm({ onSubmit, pending, error }: QuoteContactFormProps) {
  const t = useTranslations("Checkout");
  const tValidation = useTranslations("Validation");
  const form = useForm<QuoteContactValues>({
    resolver: zodResolver(createQuoteContactSchema(tValidation)),
    defaultValues: {
      fullName: "",
      phoneCountry: "65",
      phone: "",
      email: "",
      companyName: "",
      region: "Singapore",
    },
  });

  return (
    <aside className="rounded-xl border border-[#dde2e8] bg-white p-5" aria-labelledby="contact-information-title">
      <h2 id="contact-information-title" className="text-2xl font-semibold text-[#051a50]">
        {t("contactInformation")}
      </h2>
      <p className="mt-2 text-xs text-[#73798f]">{t("quoteInfoPrompt")}</p>
      {error ? <Alert className="mt-4">{error}</Alert> : null}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="mt-5 space-y-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fullName")} *</FormLabel>
                <FormControl>
                  <Input autoComplete="name" className="bg-white" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <fieldset>
            <legend className="mb-2 text-sm font-medium leading-none">
              {t("phoneNumber")} <span className="text-destructive">*</span>
            </legend>
            <div className="grid grid-cols-[116px_1fr] gap-2">
              <FormField
                control={form.control}
                name="phoneCountry"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <CountrySelect
                        {...field}
                        onValueChange={field.onChange}
                        valueFormat="dialDigits"
                        display="callingCode"
                        countryCodes={["SG", "VN"]}
                        aria-label={t("phoneCountryCode")}
                        className="bg-white px-2"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        aria-label={t("phoneNumber")}
                        inputMode="tel"
                        autoComplete="tel-national"
                        className="bg-white"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </fieldset>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("emailAddress")} *</FormLabel>
                <FormControl>
                  <Input type="email" autoComplete="email" className="bg-white" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("company")}</FormLabel>
                <FormControl>
                  <Input autoComplete="organization" className="bg-white" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="region"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("region")}</FormLabel>
                <FormControl>
                  <CountrySelect
                    {...field}
                    onValueChange={field.onChange}
                    valueFormat="name"
                    countryCodes={["SG", "VN"]}
                    placeholder={t("selectRegion")}
                    className="bg-white"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" variant="brand" disabled={pending} className="h-11 w-full shadow-none">
            {pending ? t("submitting") : t("submitRequest")}
          </Button>
          <Button
            asChild
            type="button"
            variant="outline"
            className="h-11 w-full rounded-full border-[#2474ca] text-[#164990] hover:bg-[#eef6ff] hover:text-[#164990]"
          >
            <Link href="/cart">{t("cancel")}</Link>
          </Button>
        </form>
      </Form>
    </aside>
  );
}
