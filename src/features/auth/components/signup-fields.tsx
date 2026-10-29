import { Control } from "react-hook-form";
import { useTranslations } from "next-intl";

import { CountrySelect } from "@/components/shared/country-select";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/class-names";

import { type SignupValues } from "../schemas/signup.schema";

export const inputClassName =
  "h-[42px] rounded-lg border-[#d5d7da] px-3.5 py-2.5 text-base shadow-[0_1px_2px_rgba(10,13,18,0.05)]";

export function Field({
  name,
  label,
  placeholder,
  control,
  required = false,
  className,
}: {
  name: "company" | "fullName" | "email" | "region" | "address";
  label: string;
  placeholder: string;
  control: Control<SignupValues>;
  required?: boolean;
  className?: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>
            {label} {required ? <span className="text-destructive">*</span> : null}
          </FormLabel>
          <FormControl>
            <Input
              {...field}
              placeholder={placeholder}
              autoComplete={
                name === "email"
                  ? "email"
                  : name === "fullName"
                    ? "name"
                    : name === "address"
                      ? "street-address"
                      : name === "region"
                        ? "address-level1"
                        : "organization"
              }
              className={inputClassName}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function CountryField({
  label,
  placeholder,
  control,
  required = false,
}: {
  label: string;
  placeholder: string;
  control: Control<SignupValues>;
  required?: boolean;
}) {
  return (
    <FormField
      control={control}
      name="country"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label} {required ? <span className="text-destructive">*</span> : null}
          </FormLabel>
          <FormControl>
            <CountrySelect
              {...field}
              onValueChange={field.onChange}
              placeholder={placeholder}
              className={inputClassName}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function PhoneField({ control }: { control: Control<SignupValues> }) {
  const t = useTranslations("Auth");
  return (
    <div className="space-y-2">
      <p className="inline text-sm font-medium leading-none">
        {t("phoneNumber")} <span className="text-destructive">*</span>
      </p>
      <div className="grid grid-cols-[116px_1fr] gap-2">
        <FormField
          control={control}
          name="phoneCode"
          render={({ field }) => (
            <FormItem className="space-y-0">
              <FormLabel className="sr-only">{t("callingCode")}</FormLabel>
              <FormControl>
                <CountrySelect
                  {...field}
                  onValueChange={field.onChange}
                  valueFormat="dialCode"
                  display="callingCode"
                  className={cn(inputClassName, "px-2 text-sm")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="phone"
          render={({ field }) => (
            <FormItem className="space-y-0">
              <FormLabel className="sr-only">{t("phoneNumber")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  inputMode="tel"
                  autoComplete="tel-national"
                  placeholder={t("enterPhoneNumber")}
                  className={inputClassName}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
