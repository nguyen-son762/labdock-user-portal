"use client";

import Image from "next/image";
import { useState } from "react";

import type { Country } from "@/constants/country-options";
import { cn } from "@/lib/class-names";

export function CountryFlag({ country, className }: { country: Country; className?: string }) {
  const [failed, setFailed] = useState(false);
  return country.flag && !failed ? (
    <Image
      src={country.flag}
      alt=""
      width={24}
      height={18}
      unoptimized
      className={cn("h-[18px] w-6 shrink-0 object-contain", className)}
      onError={() => setFailed(true)}
    />
  ) : (
    <span aria-hidden="true" className={cn("w-6 shrink-0 text-center text-xs text-muted-foreground", className)}>
      {country.code}
    </span>
  );
}
