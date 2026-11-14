import { z } from "zod";

export const ORDER_PERIODS = ["day", "month", "year"] as const;

export const orderPeriodSchema = z.enum(ORDER_PERIODS);

export type OrderPeriod = z.infer<typeof orderPeriodSchema>;

/** A selected calendar period. `anchor` is any UTC calendar date inside it, formatted yyyy-MM-dd. */
export type OrderPeriodSelection = {
  period: OrderPeriod;
  anchor: string;
};

const isoDateSchema = z.iso.date();

function toIsoDate(year: number, monthIndex: number, day: number): string {
  return new Date(Date.UTC(year, monthIndex, day)).toISOString().slice(0, 10);
}

function parseIsoDate(value: string) {
  const [year = 0, month = 1, day = 1] = value.split("-").map(Number);
  return { year, monthIndex: month - 1, day };
}

/** Reads a period selection from URL values; invalid input means no date filter. */
export function parseOrderPeriodSelection(
  period: string | null,
  anchor: string | null,
): OrderPeriodSelection | undefined {
  const parsedAnchor = isoDateSchema.safeParse(anchor);
  if (!parsedAnchor.success) return undefined;
  const parsedPeriod = orderPeriodSchema.safeParse(period ?? "month");
  return { period: parsedPeriod.success ? parsedPeriod.data : "month", anchor: parsedAnchor.data };
}

/** Converts a selection into the API's inclusive UTC `fromDate`/`toDate` range. */
export function getOrderPeriodRange({ period, anchor }: OrderPeriodSelection): { fromDate: string; toDate: string } {
  const { year, monthIndex } = parseIsoDate(anchor);
  if (period === "day") return { fromDate: anchor, toDate: anchor };
  if (period === "year") return { fromDate: toIsoDate(year, 0, 1), toDate: toIsoDate(year, 11, 31) };
  return { fromDate: toIsoDate(year, monthIndex, 1), toDate: toIsoDate(year, monthIndex + 1, 0) };
}

export function getOrderPeriodAnchorParts(anchor: string) {
  return parseIsoDate(anchor);
}

export function createOrderPeriodAnchor(year: number, monthIndex = 0, day = 1): string {
  return toIsoDate(year, monthIndex, day);
}

export function formatOrderPeriodLabel({ period, anchor }: OrderPeriodSelection, locale: string): string {
  const { year, monthIndex, day } = parseIsoDate(anchor);
  const date = new Date(Date.UTC(year, monthIndex, day));
  const options: Intl.DateTimeFormatOptions =
    period === "day"
      ? { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }
      : period === "month"
        ? { month: "short", year: "numeric", timeZone: "UTC" }
        : { year: "numeric", timeZone: "UTC" };
  return new Intl.DateTimeFormat(locale, options).format(date);
}
