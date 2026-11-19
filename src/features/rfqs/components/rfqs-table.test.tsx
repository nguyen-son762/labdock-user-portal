import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import type { RfqSummary } from "../schemas/rfq.schema";
import { RfqsTable } from "./rfqs-table";

const rfqs: RfqSummary[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    rfqNumber: "RFQ-2026-001",
    status: "Submitted",
    createdAt: "2026-01-01T08:00:00.000Z",
    lastActionedAt: "2026-01-02T08:00:00.000Z",
    quoteExpiresAt: "2026-01-15T08:00:00.000Z",
    itemCount: 3,
    estimatedValue: 1000,
    quotedTotal: 1250.5,
    currency: "SGD",
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    rfqNumber: "RFQ-2026-002",
    status: "Pending",
    createdAt: "2026-01-01T08:00:00.000Z",
    lastActionedAt: "2026-01-01T08:00:00.000Z",
    quoteExpiresAt: null,
    itemCount: 1,
    estimatedValue: 3000,
    quotedTotal: null,
    currency: "SGD",
  },
];

describe("RfqsTable", () => {
  it("renders the design columns in order", () => {
    renderWithProviders(<RfqsTable rfqs={rfqs} total={2} page={1} pageSize={10} onPageChange={vi.fn()} />);

    expect(screen.getAllByRole("columnheader").map((header) => header.textContent)).toEqual([
      "RFQ No.",
      "Date submitted",
      "Total products",
      "Total value",
      "Status",
      "Valid until",
    ]);
  });

  it("shows API RFQ data and links to detail by id", () => {
    renderWithProviders(<RfqsTable rfqs={rfqs} total={2} page={1} pageSize={10} onPageChange={vi.fn()} />);

    expect(screen.getAllByRole("link", { name: "#RFQ-2026-001" })[0]).toHaveAttribute(
      "href",
      "/rfqs/11111111-1111-1111-1111-111111111111",
    );
    expect(screen.getAllByText("01 Jan 2026").length).toBeGreaterThan(0);
    expect(screen.getAllByText("15 Jan 2026").length).toBeGreaterThan(0);
    expect(screen.getAllByText("3").length).toBeGreaterThan(0);
    // Quoted total wins over the estimate; unquoted RFQs fall back to the estimate.
    expect(screen.getAllByText("$1,250.50").length).toBeGreaterThan(0);
    expect(screen.getAllByText("$3,000.00").length).toBeGreaterThan(0);
    expect(screen.queryByText("$1,000.00")).not.toBeInTheDocument();
    expect(screen.getAllByText("Submitted").length).toBeGreaterThan(0);
    expect(screen.getByText("Showing 1–2 of 2")).toBeInTheDocument();
  });

  it("requests the next page when more RFQs are available", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    renderWithProviders(<RfqsTable rfqs={rfqs} total={11} page={1} pageSize={10} onPageChange={onPageChange} />);

    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});
