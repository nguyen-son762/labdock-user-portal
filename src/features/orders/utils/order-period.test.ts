import { describe, expect, it } from "vitest";

import { formatOrderPeriodLabel, getOrderPeriodRange, parseOrderPeriodSelection } from "./order-period";

describe("order period", () => {
  it.each([
    ["day", "2026-01-15", "2026-01-15", "2026-01-15"],
    ["month", "2026-01-15", "2026-01-01", "2026-01-31"],
    ["month", "2028-02-10", "2028-02-01", "2028-02-29"],
    ["month", "2026-12-03", "2026-12-01", "2026-12-31"],
    ["year", "2026-06-15", "2026-01-01", "2026-12-31"],
  ] as const)("maps a %s selection of %s to an inclusive UTC range", (period, anchor, fromDate, toDate) => {
    expect(getOrderPeriodRange({ period, anchor })).toEqual({ fromDate, toDate });
  });

  it("parses URL values and defaults the period to month", () => {
    expect(parseOrderPeriodSelection(null, "2026-01-01")).toEqual({ period: "month", anchor: "2026-01-01" });
    expect(parseOrderPeriodSelection("year", "2026-01-01")).toEqual({ period: "year", anchor: "2026-01-01" });
    expect(parseOrderPeriodSelection("week", "2026-01-01")).toEqual({ period: "month", anchor: "2026-01-01" });
  });

  it("ignores missing or invalid dates", () => {
    expect(parseOrderPeriodSelection("month", null)).toBeUndefined();
    expect(parseOrderPeriodSelection("month", "2026-13-01")).toBeUndefined();
    expect(parseOrderPeriodSelection("month", "Jan 2026")).toBeUndefined();
  });

  it("formats labels for each period", () => {
    expect(formatOrderPeriodLabel({ period: "month", anchor: "2026-01-01" }, "en")).toBe("Jan 2026");
    expect(formatOrderPeriodLabel({ period: "year", anchor: "2026-01-01" }, "en")).toBe("2026");
    expect(formatOrderPeriodLabel({ period: "day", anchor: "2026-01-05" }, "en")).toBe("Jan 05, 2026");
  });
});
