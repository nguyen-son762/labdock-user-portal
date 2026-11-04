import { screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";
import { ordersService } from "@/features/orders/api/orders.service";
import { orderKeys } from "@/features/orders/api/order-query-keys";
import { checkoutSessionFixture as session } from "../test/checkout-session.fixture";
import { checkoutSessionStorage } from "../utils/checkout-session-storage";
import { checkoutSessionKeys } from "../api/use-checkout-session-query";
import { PaymentScreen } from "./payment-screen";

const navigation = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("@/i18n/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/i18n/navigation")>()),
  useRouter: () => navigation,
}));

const order = {
  id: "11111111-1111-1111-1111-111111111111",
  orderNumber: "LDK20261",
  status: "AwaitingPayment",
  subtotal: 1035,
  tax: 93.15,
  shippingFee: 0,
  additionalFeeTotal: 0,
  platformFee: 0,
  platformFeeRateSnap: 0,
  total: 1128.15,
  currency: "SGD",
  createdAt: new Date().toISOString(),
  shippingSnapshotJson: "{}",
  invoice: {
    orderNumber: "LDK20261",
    createdAt: new Date().toISOString(),
    buyerEmail: "buyer@example.test",
    lines: [],
    subtotal: 1035,
    tax: 93.15,
    platformFee: 0,
    total: 1128.15,
    currency: "SGD",
    status: "AwaitingPayment",
  },
};

beforeEach(() => {
  navigation.push.mockReset();
  checkoutSessionStorage.clear();
  checkoutSessionStorage.set(session);
  vi.spyOn(ordersService, "getById").mockResolvedValue(order);
});

describe("Bank transfer screen", () => {
  it("fetches current order details on entry even when the cache is fresh", async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(orderKeys.detail(order.id), { ...order, total: 1, orderNumber: "CACHED-ORDER" });
    let resolveOrder: ((value: typeof order) => void) | undefined;
    vi.mocked(ordersService.getById).mockReturnValue(
      new Promise((resolve) => {
        resolveOrder = resolve;
      }),
    );

    renderWithProviders(
      <QueryClientProvider client={queryClient}>
        <PaymentScreen orderId={order.id} />
      </QueryClientProvider>,
    );

    await waitFor(() => expect(ordersService.getById).toHaveBeenCalledWith(order.id, expect.any(AbortSignal)));
    expect(screen.queryByText("CACHED-ORDER")).not.toBeInTheDocument();
    expect(screen.queryByRole("img", { name: /QR code/ })).not.toBeInTheDocument();
    resolveOrder?.({ ...order, status: "Draft" });
    expect(await screen.findByText("Amount: $99.50")).toBeInTheDocument();
    expect(screen.getByText(session.refCode)).toBeInTheDocument();
  });

  it("restores API payment instructions after reload, copies refCode, and opens the success screen", async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    renderWithProviders(<PaymentScreen orderId={order.id} />);

    expect(await screen.findByText("Bank transfer")).toBeInTheDocument();
    expect(screen.getByText("Amount: $99.50")).toBeInTheDocument();
    expect(screen.getByText("Company name: i-DNA")).toBeInTheDocument();
    expect(screen.getByText("Business registration no.: 202012345A")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Bank transfer payment QR code" })).toHaveAttribute(
      "src",
      session.qrImageUrl,
    );
    expect(ordersService.getById).toHaveBeenCalledWith(order.id, expect.any(AbortSignal));
    await user.click(screen.getByRole("button", { name: "Copy reference code" }));
    expect(writeText).toHaveBeenCalledWith(session.refCode);
    expect(screen.getByRole("status")).toHaveTextContent("Reference code copied.");
    expect(screen.getByRole("link", { name: "Cancel payment" })).toHaveAttribute("href", "/checkout");

    await user.click(screen.getByRole("button", { name: "I've transferred" }));
    expect(navigation.push).toHaveBeenCalledWith(`/payment/success?orderId=${order.id}`);
  });

  it("preserves the deadline on reload and prevents continuing after it expires", async () => {
    checkoutSessionStorage.set({ ...session, paymentExpiresAt: new Date(Date.now() - 1000).toISOString() });
    renderWithProviders(<PaymentScreen orderId={order.id} />);
    await screen.findByText("Bank transfer");
    await waitFor(() => expect(screen.getByRole("button", { name: "I've transferred" })).toBeDisabled());
    expect(screen.getByText(/The payment window has ended/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View order" })).toHaveAttribute("href", `/orders/${order.id}`);
  });

  it("keeps the reference available when clipboard permission is denied", async () => {
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new Error("Permission denied"));
    renderWithProviders(<PaymentScreen orderId={order.id} />);
    await user.click(await screen.findByRole("button", { name: "Copy reference code" }));
    expect(screen.getByRole("status")).toHaveTextContent("Unable to copy.");
    expect(screen.getByText(session.refCode)).toBeInTheDocument();
  });

  it("shows an error and retries loading the same order", async () => {
    vi.mocked(ordersService.getById).mockRejectedValueOnce(new Error("Unavailable"));
    const user = userEvent.setup();
    renderWithProviders(<PaymentScreen orderId={order.id} />);
    expect(await screen.findByRole("alert")).toHaveTextContent("We could not load payment details.");
    expect(screen.queryByRole("img", { name: /QR code/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("Bank transfer")).toBeInTheDocument();
  });

  it.each(["Paid", "Shipped", "Cancelled"])(
    "shows the QR screen for a %s order without checking status",
    async (status) => {
      vi.mocked(ordersService.getById).mockResolvedValue({ ...order, status });
      renderWithProviders(<PaymentScreen orderId={order.id} />);
      expect(await screen.findByRole("img", { name: "Bank transfer payment QR code" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "I've transferred" })).toBeInTheDocument();
      expect(screen.queryByText(/no longer awaiting payment/)).not.toBeInTheDocument();
    },
  );

  it("shows bank transfer instructions for a new order", async () => {
    vi.mocked(ordersService.getById).mockResolvedValue({ ...order, status: "New" });
    renderWithProviders(<PaymentScreen orderId={order.id} />);
    expect(await screen.findByRole("img", { name: "Bank transfer payment QR code" })).toBeInTheDocument();
  });

  it("uses the API deadline even when the order was created over an hour ago", async () => {
    vi.mocked(ordersService.getById).mockResolvedValue({
      ...order,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    });
    renderWithProviders(<PaymentScreen orderId={order.id} />);
    await waitFor(() => expect(screen.getByRole("button", { name: "I've transferred" })).toBeEnabled());
    expect(screen.queryByText(/The payment window has ended/)).not.toBeInTheDocument();
  });

  it("uses in-memory instructions when storage is unavailable", async () => {
    checkoutSessionStorage.clear();
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(checkoutSessionKeys.detail(order.id), session);
    renderWithProviders(
      <QueryClientProvider client={queryClient}>
        <PaymentScreen orderId={order.id} />
      </QueryClientProvider>,
    );
    expect(await screen.findByText(session.refCode)).toBeInTheDocument();
  });

  it("does not show a sample QR when payment instructions are missing", async () => {
    checkoutSessionStorage.clear();
    renderWithProviders(<PaymentScreen orderId={order.id} />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Payment instructions are unavailable");
    expect(screen.queryByRole("img", { name: /QR code/ })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View order" })).toHaveAttribute("href", `/orders/${order.id}`);
  });

  it("opens payment with the amount and reference when the API returns blank bank configuration", async () => {
    checkoutSessionStorage.set({ ...session, companyName: "", businessRegistrationNo: "", qrImageUrl: "" });
    renderWithProviders(<PaymentScreen orderId={order.id} />);
    expect(await screen.findByText("Amount: $99.50")).toBeInTheDocument();
    expect(screen.getByText(session.refCode)).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("The payment QR code is not available yet.");
    expect(screen.queryByRole("img", { name: /QR code/ })).not.toBeInTheDocument();
    expect(screen.queryByText(/Company name:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Business registration no.:/)).not.toBeInTheDocument();
    expect(
      screen.queryByText("Open your banking app and scan this QR code to complete payment"),
    ).not.toBeInTheDocument();
  });
});
