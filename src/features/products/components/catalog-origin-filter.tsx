"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCountryName } from "@/constants/country-options";

type CatalogOriginFilterProps = {
  origins: readonly string[];
  selectedOrigins: readonly string[];
  disabled: boolean;
  hasError: boolean;
  onChange: (origins: string[]) => void;
};

export function CatalogOriginFilter({
  origins,
  selectedOrigins,
  disabled,
  hasError,
  onChange,
}: CatalogOriginFilterProps) {
  const t = useTranslations("Catalog");
  const id = useId();
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const normalizedQuery = query.trim().toLowerCase();
  const originOptions = origins
    .map((code) => ({ code, name: getCountryName(code) }))
    .sort((left, right) => left.name.localeCompare(right.name, "en"));
  const matchingOrigins = originOptions.filter(({ code, name }) =>
    [code, name].some((candidate) => candidate.toLowerCase().includes(normalizedQuery)),
  );
  const visibleOrigins = expanded || query.trim() ? matchingOrigins : matchingOrigins.slice(0, 5);

  return (
    <fieldset className="min-w-0 border-b border-[#ecf0f3] pb-4">
      <legend className="w-full">
        <Button
          type="button"
          variant="ghost"
          aria-expanded={isOpen}
          aria-controls={`${id}-content`}
          onClick={() => setIsOpen((open) => !open)}
          className="h-auto w-full justify-between rounded-none py-1.5 pl-1 pr-0 text-sm font-medium leading-5 text-[#2e3038] hover:bg-transparent hover:text-[#2e3038]"
        >
          {t("origin")}
          <Image
            src="/products/filters/chevron-up.svg"
            alt=""
            width={16}
            height={16}
            aria-hidden="true"
            className={isOpen ? undefined : "rotate-180"}
          />
        </Button>
      </legend>
      <div id={`${id}-content`} hidden={!isOpen}>
        <div className="relative mt-1">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label={t("searchOrigins")}
            placeholder={t("searchOrigins")}
            disabled={disabled || hasError || origins.length === 0}
            className="h-10 rounded-sm border-[#dde2e8] bg-white pl-3.5 pr-10 text-sm placeholder:text-[#b1bac8] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          <Image
            src="/products/filters/search.svg"
            alt=""
            width={16}
            height={16}
            aria-hidden="true"
            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2"
          />
        </div>
        {hasError ? (
          <p role="status" className="mt-3 text-xs text-[#b42318]">
            {t("unableOrigins")}
          </p>
        ) : (
          <div id={`${id}-options`} className="mt-1 max-h-64 space-y-0.5 overflow-y-auto">
            {visibleOrigins.map(({ code: origin, name }) => {
              const optionId = `${id}-${encodeURIComponent(origin)}`;
              return (
                <div key={origin} className="flex min-h-8 items-center gap-2 pl-1">
                  <Checkbox
                    id={optionId}
                    checked={selectedOrigins.includes(origin)}
                    disabled={disabled}
                    onCheckedChange={(checked) =>
                      onChange(
                        checked === true
                          ? [...selectedOrigins, origin]
                          : selectedOrigins.filter((selected) => selected !== origin),
                      )
                    }
                    className="border-[#c8d0d9] shadow-none data-[state=checked]:border-[#596ab7] data-[state=checked]:bg-[#f2f7fd]"
                  />
                  <Label
                    htmlFor={optionId}
                    className="min-w-0 flex-1 cursor-pointer break-words py-1.5 text-sm font-medium leading-5 text-[#2e3038]"
                  >
                    {name}
                  </Label>
                </div>
              );
            })}
            {matchingOrigins.length === 0 ? (
              <p role="status" className="py-3 text-xs text-[#73798f]">
                {t(origins.length ? "noMatchingOrigins" : "noOrigins")}
              </p>
            ) : null}
          </div>
        )}
        {!hasError && !query.trim() && matchingOrigins.length > 5 ? (
          <div className="mt-2 flex justify-center">
            <Button
              type="button"
              variant="ghost"
              disabled={disabled}
              aria-expanded={expanded}
              aria-controls={`${id}-options`}
              onClick={() => setExpanded((value) => !value)}
              className="h-auto w-fit gap-2 rounded-none p-0 text-sm font-semibold leading-5 text-[#1f5fa8] shadow-none hover:bg-transparent hover:text-[#1f5fa8] hover:underline"
            >
              {t(expanded ? "seeLess" : "seeMore")}
              <Image
                src="/products/filters/arrow-down.svg"
                alt=""
                width={16}
                height={16}
                aria-hidden="true"
                className={expanded ? "rotate-180" : undefined}
              />
            </Button>
          </div>
        ) : null}
      </div>
    </fieldset>
  );
}
