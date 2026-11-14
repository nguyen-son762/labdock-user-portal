"use client";

import { ArrowLeft2, ArrowRight2, Calendar as CalendarIcon } from "iconsax-reactjs";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/class-names";

import {
  createOrderPeriodAnchor,
  formatOrderPeriodLabel,
  getOrderPeriodAnchorParts,
  ORDER_PERIODS,
  orderPeriodSchema,
  type OrderPeriod,
  type OrderPeriodSelection,
} from "../utils/order-period";

const YEARS_PER_PAGE = 12;

type OrderPeriodFilterProps = {
  value: OrderPeriodSelection | undefined;
  period: OrderPeriod;
  onChange: (value: OrderPeriodSelection) => void;
  onPeriodChange: (period: OrderPeriod) => void;
};

function getTodayAnchor() {
  const today = new Date();
  return createOrderPeriodAnchor(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
}

function PickerHeader({
  label,
  previousLabel,
  nextLabel,
  onPrevious,
  onNext,
}: {
  label: string;
  previousLabel: string;
  nextLabel: string;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8"
        aria-label={previousLabel}
        onClick={onPrevious}
      >
        <ArrowLeft2 className="size-4" aria-hidden="true" />
      </Button>
      <span className="text-sm font-semibold text-[#051a50]" aria-live="polite">
        {label}
      </span>
      <Button type="button" variant="ghost" size="icon" className="size-8" aria-label={nextLabel} onClick={onNext}>
        <ArrowRight2 className="size-4" aria-hidden="true" />
      </Button>
    </div>
  );
}

function PickerOption({ label, isSelected, onSelect }: { label: string; isSelected: boolean; onSelect: () => void }) {
  return (
    <Button
      type="button"
      variant="ghost"
      aria-pressed={isSelected}
      onClick={onSelect}
      className={cn(
        "h-9 px-2 text-sm font-normal text-[#051a50]",
        isSelected && "bg-[#164990] text-white hover:bg-[#164990] hover:text-white",
      )}
    >
      {label}
    </Button>
  );
}

export function OrderPeriodFilter({ value, period, onChange, onPeriodChange }: OrderPeriodFilterProps) {
  const t = useTranslations("Orders");
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const selected = value ? getOrderPeriodAnchorParts(value.anchor) : undefined;
  const initial = getOrderPeriodAnchorParts(value?.anchor ?? getTodayAnchor());
  const [viewYear, setViewYear] = useState(initial.year);
  const decadeStart = viewYear - (viewYear % YEARS_PER_PAGE);
  const monthFormatter = new Intl.DateTimeFormat(locale, { month: "short", timeZone: "UTC" });

  function handleOpenChange(open: boolean) {
    if (open) setViewYear(initial.year);
    setIsOpen(open);
  }

  function select(anchor: string) {
    onChange({ period, anchor });
    setIsOpen(false);
  }

  function handlePeriodChange(nextPeriod: string) {
    const parsedPeriod = orderPeriodSchema.safeParse(nextPeriod);
    if (parsedPeriod.success) onPeriodChange(parsedPeriod.data);
  }

  return (
    <div className="flex h-10 w-full items-center rounded-full border border-[#c8d0d9] bg-white shadow-[0_1px_2px_rgba(10,13,18,0.05)] sm:w-auto">
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            aria-label={t("filterByDate")}
            className="h-full flex-1 justify-start gap-2 rounded-l-full rounded-r-none px-4 text-[13px] font-medium text-[#051a50] hover:bg-[#f3f8fc] sm:flex-none"
          >
            <CalendarIcon className="size-5" aria-hidden="true" />
            <span className={cn(!value && "text-[#73798f]")}>
              {value ? formatOrderPeriodLabel(value, locale) : t("selectDate")}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className={cn(
            "rounded-xl border border-[#dde2e8] bg-white p-3 text-[#051a50] shadow-[0_16px_40px_rgba(5,26,80,0.18)]",
            period === "day" ? "w-auto p-0" : "w-[280px]",
          )}
        >
          {period === "day" ? (
            <Calendar
              mode="single"
              selected={selected ? new Date(selected.year, selected.monthIndex, selected.day) : undefined}
              defaultMonth={new Date(initial.year, initial.monthIndex, 1)}
              onSelect={(date) => {
                if (date) select(createOrderPeriodAnchor(date.getFullYear(), date.getMonth(), date.getDate()));
              }}
              autoFocus
            />
          ) : period === "month" ? (
            <>
              <PickerHeader
                label={String(viewYear)}
                previousLabel={t("previousYear")}
                nextLabel={t("nextYear")}
                onPrevious={() => setViewYear((year) => year - 1)}
                onNext={() => setViewYear((year) => year + 1)}
              />
              <div className="grid grid-cols-3 gap-1">
                {Array.from({ length: 12 }, (_, monthIndex) => (
                  <PickerOption
                    key={monthIndex}
                    label={monthFormatter.format(new Date(Date.UTC(viewYear, monthIndex, 1)))}
                    isSelected={selected?.year === viewYear && selected.monthIndex === monthIndex}
                    onSelect={() => select(createOrderPeriodAnchor(viewYear, monthIndex))}
                  />
                ))}
              </div>
            </>
          ) : (
            <>
              <PickerHeader
                label={`${decadeStart} – ${decadeStart + YEARS_PER_PAGE - 1}`}
                previousLabel={t("previousYears")}
                nextLabel={t("nextYears")}
                onPrevious={() => setViewYear((year) => year - YEARS_PER_PAGE)}
                onNext={() => setViewYear((year) => year + YEARS_PER_PAGE)}
              />
              <div className="grid grid-cols-3 gap-1">
                {Array.from({ length: YEARS_PER_PAGE }, (_, index) => decadeStart + index).map((year) => (
                  <PickerOption
                    key={year}
                    label={String(year)}
                    isSelected={selected?.year === year}
                    onSelect={() => select(createOrderPeriodAnchor(year))}
                  />
                ))}
              </div>
            </>
          )}
        </PopoverContent>
      </Popover>
      <span className="h-full w-px bg-[#c8d0d9]" aria-hidden="true" />
      <Select value={period} onValueChange={handlePeriodChange}>
        <SelectTrigger
          aria-label={t("periodType")}
          className="h-full w-[110px] gap-2 rounded-l-none rounded-r-full border-0 bg-transparent pl-4 pr-4 text-[13px] font-medium text-[#051a50] shadow-none [&>svg]:size-5 [&>svg]:opacity-100"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ORDER_PERIODS.map((option) => (
            <SelectItem key={option} value={option}>
              {t(`periods.${option}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
