"use client";

import { Add, Minus } from "iconsax-reactjs";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { NumberInput } from "@/components/ui/number-input";

type ProductQuantityStepperProps = {
  value: number;
  max: number;
  disabled: boolean;
  onChange: (quantity: number) => void;
};

const MAX_TYPED_QUANTITY = 999_999;

/**
 * Quantity control that accepts typed values or +/- steps. Typed values are reported as they change,
 * including values above `max`, so the caller can explain the stock limit; the buttons stay within 1..max.
 */
export function ProductQuantityStepper({ value, max, disabled, onChange }: ProductQuantityStepperProps) {
  const t = useTranslations("Product");
  const [draft, setDraft] = useState<string>();
  const upperBound = Math.max(1, max);

  function step(next: number) {
    setDraft(undefined);
    onChange(Math.min(upperBound, Math.max(1, next)));
  }

  return (
    <div className="flex h-11 w-full items-center rounded-lg border border-[#e9eaeb]">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={t("decreaseQuantity")}
        disabled={disabled || value <= 1}
        onClick={() => step(value - 1)}
        className="h-full w-10 rounded-none border-r border-[#e9eaeb] text-[#164990]"
      >
        <Minus className="size-4" aria-hidden="true" />
      </Button>
      <NumberInput
        value={draft ?? String(value)}
        valueIsNumericString
        decimalScale={0}
        allowNegative={false}
        allowLeadingZeros={false}
        inputMode="numeric"
        aria-label={t("quantity")}
        disabled={disabled}
        isAllowed={({ floatValue }) => floatValue === undefined || floatValue <= MAX_TYPED_QUANTITY}
        onValueChange={({ floatValue }, { source }) => {
          if (source !== "event") return;
          if (!floatValue) {
            setDraft("");
            return;
          }
          setDraft(undefined);
          onChange(floatValue);
        }}
        onBlur={() => {
          if (draft !== undefined) step(1);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
        }}
        className="h-full min-w-20 flex-1 rounded-none border-0 bg-transparent text-center text-base font-semibold text-[#051a50] shadow-none focus-visible:ring-2 focus-visible:ring-inset"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={t("increaseQuantity")}
        disabled={disabled || value >= max}
        onClick={() => step(Math.min(value, upperBound - 1) + 1)}
        className="h-full w-10 rounded-none border-l border-[#e9eaeb] text-[#164990]"
      >
        <Add className="size-4" aria-hidden="true" />
      </Button>
    </div>
  );
}
