import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import type { RfqDetail } from "../schemas/rfq.schema";
import { RfqItemsCard } from "./rfq-items-card";

const rfq: RfqDetail = {
  id: "11111111-1111-1111-1111-111111111111",
  rfqNumber: "RFQ-0018",
  status: "Quoted",
  message: null,
  contact: null,
  createdAt: "2026-01-01T08:00:00.000Z",
  lastActionedAt: "2026-01-02T08:00:00.000Z",
  quoteExpiresAt: null,
  estimatedValue: 4700,
  quotedTotal: 4539.85,
  currency: "SGD",
  items: [
    {
      id: "22222222-2222-2222-2222-222222222222",
      variantId: "33333333-3333-3333-3333-333333333333",
      productName: "Beakers, Griffin, Low Form, with spout",
      variantName: "Standard 5mL",
      sku: "9000000001",
      quantity: 100,
      listedUnitPrice: 35,
      estimatedValue: 3500,
      quoteUnitPrice: 33.25,
    },
    {
      id: "44444444-4444-4444-4444-444444444444",
      variantId: "55555555-5555-5555-5555-555555555555",
      productName: "Digital Laboratory Microscope with HD Camera",
      variantName: "White",
      sku: "1000000001",
      quantity: 1,
      listedUnitPrice: 1200,
      estimatedValue: 1200,
      quoteUnitPrice: 840,
    },
  ],
};

describe("RfqItemsCard", () => {
  it("renders the design columns and quoted line subtotals", () => {
    renderWithProviders(<RfqItemsCard rfq={rfq} />);

    expect(screen.getByRole("heading", { name: "RFQ no.: #RFQ-0018" })).toBeInTheDocument();
    expect(screen.getByText("Date submitted: 01 Jan 2026")).toBeInTheDocument();
    expect(screen.getAllByRole("columnheader").map((header) => header.textContent)).toEqual([
      "Product",
      "Unit price",
      "Size",
      "Requested qty.",
      "Quoted unit price",
      "Subtotal",
    ]);

    const [, firstRow] = screen.getAllByRole("row");
    const cells = within(firstRow!).getAllByRole("cell").map((cell) => cell.textContent);
    expect(cells).toEqual([
      "Beakers, Griffin, Low Form, with spoutCategory no.: 9000000001",
      "$35.00",
      "Standard 5mL",
      "100",
      "$33.25",
      "$3,325.00",
    ]);
    expect(screen.getByText("$4,165.00")).toBeInTheDocument();
    expect(screen.getByText("$4,539.85")).toBeInTheDocument();
  });

  it("falls back to the estimate when an item has not been quoted yet", () => {
    renderWithProviders(
      <RfqItemsCard
        rfq={{
          ...rfq,
          quotedTotal: null,
          items: [{ ...rfq.items[1]!, quoteUnitPrice: null }],
        }}
      />,
    );

    const [, row] = screen.getAllByRole("row");
    const cells = within(row!).getAllByRole("cell").map((cell) => cell.textContent);
    expect(cells.slice(4)).toEqual(["-", "$1,200.00"]);
    expect(screen.getByText("$4,700.00")).toBeInTheDocument();
  });

  it("shows placeholders for an unnamed, unpriced item", () => {
    renderWithProviders(
      <RfqItemsCard
        rfq={{
          ...rfq,
          estimatedValue: null,
          quotedTotal: null,
          currency: null,
          items: [
            {
              ...rfq.items[0]!,
              productName: null,
              variantName: null,
              sku: null,
              listedUnitPrice: null,
              estimatedValue: null,
              quoteUnitPrice: null,
            },
          ],
        }}
      />,
    );

    const [, row] = screen.getAllByRole("row");
    const cells = within(row!).getAllByRole("cell").map((cell) => cell.textContent);
    expect(cells).toEqual(["Unnamed product", "-", "-", "100", "-", "-"]);
  });
});
