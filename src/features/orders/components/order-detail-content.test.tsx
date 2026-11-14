import { act, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { createOrderDetailFixture } from "../test/order-detail.fixture";
import { OrderDetailContent } from "./order-detail-content";

describe("order detail layouts", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime("2026-11-09T10:00:00Z");
  });
  afterEach(() => vi.useRealTimers());

  it("shows pending payment actions, the live deadline and structured delivery information", () => {
    const order = createOrderDetailFixture();
    renderWithProviders(<OrderDetailContent order={order} />);
    expect(screen.getByRole("heading", { name: "#OR-3005" })).toBeInTheDocument();
    expect(screen.getByText("Pending payment")).toBeInTheDocument();
    expect(screen.getByRole("timer")).toHaveTextContent("00:45:12");
    expect(screen.getByRole("link", { name: "Continue payment" })).toHaveAttribute(
      "href",
      `/payment?orderId=${order.id}`,
    );
    expect(screen.getByRole("button", { name: "Cancel payment" })).toBeEnabled();
    expect(screen.getByText(/Sarah Chen • Biogenix/)).toBeInTheDocument();
    expect(screen.getByText(/745 Lor. 5 Toa Payoh/)).toBeInTheDocument();
    expect(screen.getByText("Bank transfer")).toBeInTheDocument();
    expect(screen.getByText(/Not paid yet · Ref code: LDK/)).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Delivery tracking" })).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByRole("timer")).toHaveTextContent("00:45:11");
  });

  it("stops continuing payment at the deadline without pretending to cancel the order", () => {
    renderWithProviders(
      <OrderDetailContent order={createOrderDetailFixture({ paymentExpiresAt: "2026-11-09T10:00:02Z" })} />,
    );
    act(() => vi.advanceTimersByTime(2000));
    expect(screen.getByRole("heading", { name: "The payment window has ended" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continue payment" })).toBeDisabled();
    expect(screen.getByText("Pending payment")).toBeInTheDocument();
  });

  it("shows the awaiting confirmation state without payment actions once the transfer is reported", () => {
    renderWithProviders(<OrderDetailContent order={createOrderDetailFixture({ status: "PaymentSubmitted" })} />);
    expect(screen.getByRole("heading", { name: /awaiting confirmation/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Cancel payment" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Continue payment" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Delivery tracking" })).not.toBeInTheDocument();
  });

  it.each(["New", "Processing", "Shipped", "Delivered"])("shows the delivery layout for %s", (status) => {
    renderWithProviders(<OrderDetailContent order={createOrderDetailFixture({ status })} />);
    expect(screen.getByRole("heading", { name: "Delivery tracking" })).toBeInTheDocument();
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Continue payment" })).not.toBeInTheDocument();
    expect(screen.getByText(/Visa ending 4242/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Download invoice" })).toBeDisabled();
    expect(screen.getByText(/INV-3041/)).toBeInTheDocument();
  });

  it("marks the shipped step as current and copies the tracking number", async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    const copy = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    renderWithProviders(<OrderDetailContent order={createOrderDetailFixture({ status: "Shipped" })} />);
    const steps = within(screen.getByRole("list", { name: "Delivery tracking" })).getAllByRole("listitem");
    expect(steps[2]).toHaveAttribute("aria-current", "step");
    await user.click(screen.getByRole("button", { name: "Copy tracking number" }));
    expect(copy).toHaveBeenCalledWith("SG192847364");
    expect(screen.getByRole("status")).toHaveTextContent("Tracking number copied.");
  });

  it.each(["Cancelled", "Canceled"])("does not show delivery progress or payment actions for %s", (status) => {
    renderWithProviders(<OrderDetailContent order={createOrderDetailFixture({ status })} />);
    expect(screen.queryByRole("heading", { name: "Delivery tracking" })).not.toBeInTheDocument();
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Continue payment" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Continue payment" })).not.toBeInTheDocument();
  });

  it("handles missing delivery data and preserves nonzero fees in the total breakdown", () => {
    renderWithProviders(
      <OrderDetailContent
        order={createOrderDetailFixture({
          shippingSnapshotJson: "invalid-json",
          platformFee: 20,
          additionalFeeTotal: 10,
          shippingFee: 5,
        })}
      />,
    );
    expect(screen.getByText("No shipping details are available for this order.")).toBeInTheDocument();
    expect(screen.getByText("Platform fee")).toBeInTheDocument();
    expect(screen.getByText("Additional fees")).toBeInTheDocument();
  });
});
