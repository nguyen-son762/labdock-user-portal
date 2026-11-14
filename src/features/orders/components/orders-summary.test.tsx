import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { OrdersSummary } from "./orders-summary";

const summary = {
  totalSpent: 13905,
  currency: "SGD",
  totalOrders: 11,
  countsByStatus: [
    { status: "PendingPayment", count: 1 },
    { status: "Paid", count: 1 },
    { status: "Processing", count: 2 },
    { status: "Shipped", count: 2 },
    { status: "Delivered", count: 3 },
  ],
};

describe("OrdersSummary", () => {
  it("shows total spent and status counts", () => {
    renderWithProviders(
      <OrdersSummary summary={summary} total={11} activeStatus={undefined} onStatusChange={vi.fn()} />,
    );

    expect(screen.getByText("Total spent")).toBeInTheDocument();
    expect(screen.getByText(/13,905\.00/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Total orders\s*11/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /Awaiting shipment\s*1/ })).toHaveAttribute("aria-pressed", "false");
  });

  it("filters by a status and clears the filter when pressed again", async () => {
    const onStatusChange = vi.fn();
    const user = userEvent.setup();
    const { rerender } = renderWithProviders(
      <OrdersSummary summary={summary} total={11} activeStatus={undefined} onStatusChange={onStatusChange} />,
    );

    await user.click(screen.getByRole("button", { name: /Shipped/ }));
    expect(onStatusChange).toHaveBeenLastCalledWith("Shipped");

    await user.click(screen.getByRole("button", { name: /Awaiting shipment/ }));
    expect(onStatusChange).toHaveBeenLastCalledWith("PendingPayment");

    rerender(<OrdersSummary summary={summary} total={11} activeStatus="Shipped" onStatusChange={onStatusChange} />);
    await user.click(screen.getByRole("button", { name: /Shipped/ }));
    expect(onStatusChange).toHaveBeenLastCalledWith(undefined);
  });

  it("falls back to the list total when the API has no summary", () => {
    renderWithProviders(<OrdersSummary summary={null} total={4} activeStatus={undefined} onStatusChange={vi.fn()} />);

    expect(screen.queryByText("Total spent")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Total orders\s*4/ })).toBeInTheDocument();
  });
});
