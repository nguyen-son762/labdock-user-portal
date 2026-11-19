"use client";

import { SearchNormal1 } from "iconsax-reactjs";
import { useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";

const SEARCH_DEBOUNCE_MS = 400;

type DebouncedSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
};

/** Keeps typing responsive and only commits the search term once the user pauses or presses Enter. */
export function DebouncedSearchInput({ value, onChange, label, placeholder }: DebouncedSearchInputProps) {
  const [draft, setDraft] = useState(value);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => setDraft(value), [value]);

  useEffect(() => {
    if (draft.trim() === value.trim()) return;
    const timeout = window.setTimeout(() => onChangeRef.current(draft), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timeout);
  }, [draft, value]);

  return (
    <div className="relative w-full sm:w-[320px]">
      <SearchNormal1
        className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-[#73798f]"
        aria-hidden="true"
      />
      <Input
        type="search"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") onChangeRef.current(draft);
        }}
        maxLength={100}
        aria-label={label}
        placeholder={placeholder}
        className="h-11 rounded-full border-[#dde2e8] bg-white pl-[42px] pr-3.5 text-base text-[#051a50] shadow-[0_1px_1px_rgba(10,13,18,0.05)] placeholder:text-[#b1bac8]"
      />
    </div>
  );
}
