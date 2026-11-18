"use client";

import { ArrowDown2, TickCircle } from "iconsax-reactjs";
import { useTranslations } from "next-intl";
import { forwardRef, useRef, useState, type ComponentPropsWithoutRef } from "react";

import { CountryFlag } from "@/components/shared/country-flag";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { countries, resolveCountryCode, type Country } from "@/constants/country-options";
import { cn } from "@/lib/class-names";

type CountrySelectProps = Omit<ComponentPropsWithoutRef<typeof Button>, "value" | "onChange"> & {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  valueFormat?: "code" | "name" | "dialCode" | "dialDigits";
  display?: "country" | "callingCode";
  countryCodes?: readonly string[];
};

function getValue(country: Country, format: NonNullable<CountrySelectProps["valueFormat"]>) {
  if (format === "name") return country.name;
  if (format === "dialCode") return country.dialCode;
  if (format === "dialDigits") return country.dialCode.replace(/^\+/, "");
  return country.code;
}

function normalizeSearch(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export const CountrySelect = forwardRef<HTMLButtonElement, CountrySelectProps>(function CountrySelect(
  {
    value,
    onValueChange,
    placeholder,
    valueFormat = "code",
    display = "country",
    countryCodes,
    className,
    onKeyDown,
    ...props
  },
  ref,
) {
  const t = useTranslations("CountrySelect");
  const [open, setOpen] = useState(false);
  // Dial codes may belong to several countries; retain the country the user chose.
  const [chosenCode, setChosenCode] = useState<string>();
  const searchRef = useRef<HTMLInputElement>(null);
  const options = countryCodes ? countries.filter(({ code }) => countryCodes.includes(code)) : countries;
  const resolvedCode = resolveCountryCode(value);
  const matchesValue = (country: Country) =>
    valueFormat === "code" || valueFormat === "name"
      ? country.code === resolvedCode
      : getValue(country, valueFormat) === value;
  const selected =
    options.find((country) => country.code === chosenCode && matchesValue(country)) ?? options.find(matchesValue);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={ref}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("h-11 w-full justify-between px-3 text-left font-normal shadow-sm", className)}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (!event.defaultPrevented && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
              event.preventDefault();
              setOpen(true);
            }
          }}
          {...props}
        >
          <span className="flex min-w-0 items-center gap-2">
            {selected ? <CountryFlag key={selected.code} country={selected} /> : null}
            <span className={cn("truncate", !selected && !value && "text-muted-foreground")}>
              {selected
                ? display === "callingCode"
                  ? selected.dialCode
                  : selected.name
                : value || placeholder || t("placeholder")}
            </span>
          </span>
          <ArrowDown2 className="size-4 shrink-0 opacity-50" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        aria-label={t("countries")}
        align="start"
        className="w-[max(var(--radix-popover-trigger-width),280px)] max-w-[calc(100vw-2rem)] bg-card p-0"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          searchRef.current?.focus();
        }}
      >
        <Command
          label={t("search")}
          loop
          defaultValue={selected?.code}
          filter={(code, search, keywords = []) =>
            normalizeSearch([code, ...keywords].join(" ")).includes(normalizeSearch(search.trim())) ? 1 : 0
          }
        >
          <CommandInput ref={searchRef} aria-label={t("search")} placeholder={t("search")} />
          <CommandList label={t("countries")}>
            <CommandEmpty role="status">{t("empty")}</CommandEmpty>
            {options.map((country) => (
              <CommandItem
                key={country.code}
                value={country.code}
                keywords={[country.name, country.dialCode, ...country.aliases]}
                onSelect={() => {
                  setChosenCode(country.code);
                  onValueChange(getValue(country, valueFormat));
                  setOpen(false);
                }}
              >
                <CountryFlag country={country} />
                <span className="min-w-0 flex-1">{country.name}</span>
                {display === "callingCode" ? <span className="text-muted-foreground">{country.dialCode}</span> : null}
                {selected?.code === country.code ? <TickCircle className="size-4 shrink-0" aria-hidden="true" /> : null}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
});
