import { act, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { PaymentCountdown } from "./payment-countdown";

vi.mock("@/i18n/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/i18n/navigation")>()),
  useRouter: () => ({ push: vi.fn() }),
}));

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime("2026-11-09T10:00:00Z");
});

afterEach(() => vi.useRealTimers());

describe("payment deadline countdown", () => {
  it("counts down to the exact API deadline and disables continuing when it expires", () => {
    renderWithProviders(
      <PaymentCountdown orderId="order-id" orderNumber="OR-1" paymentExpiresAt="2026-11-09T18:00:30+08:00" />,
    );
    const timer = screen.getByRole("timer");
    expect(within(timer).getByText("30")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "I've transferred" })).toBeEnabled();
    act(() => vi.advanceTimersByTime(1000));
    expect(within(timer).getByText("29")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(29000));
    expect(screen.getByRole("button", { name: "I've transferred" })).toBeDisabled();
    expect(screen.getByText(/The payment window has ended/)).toBeInTheDocument();
    expect(within(timer).getAllByText("00")).toHaveLength(3);
  });

  it("keeps the server deadline when remounting after a reload", () => {
    const first = renderWithProviders(
      <PaymentCountdown orderId="order-id" orderNumber="OR-1" paymentExpiresAt="2026-11-09T10:00:30Z" />,
    );
    act(() => vi.advanceTimersByTime(20000));
    first.unmount();
    renderWithProviders(
      <PaymentCountdown orderId="order-id" orderNumber="OR-1" paymentExpiresAt="2026-11-09T10:00:30Z" />,
    );
    expect(within(screen.getByRole("timer")).getByText("10")).toBeInTheDocument();
  });
});
