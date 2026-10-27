import { cn } from "@/lib/class-names";

export function NewsCategoryBadge({ category, compact = false }: { category: string; compact?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-[#eaf3ff] font-medium text-[#164990]",
        compact ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
      )}
    >
      {category}
    </span>
  );
}
