import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render-with-providers";
import { PaymentSuccessScreen } from "./payment-success-screen";

const query = vi.hoisted(() => ({
  data: {
    id: "11111111-1111-1111-1111-111111111111",
    total: 145.3,
    currency: "SGD",
    invoice: { buyerEmail: "buyer@example.test" },
  },
  isPending: false,
  isFetching: false,
  isFetchedAfterMount: true,
  isError: false,
  refetch: vi.fn(),
}));
vi.mock("@/features/orders", () => ({ useOrderDetailQuery: () => query }));

beforeEach(() => {
  query.isPending = false;
  query.isError = false;
  query.refetch.mockReset();
});

it("shows the actual order total, email and navigation from the success design", () => {
  renderWithProviders(<PaymentSuccessScreen orderId={query.data.id} />);
  expect(screen.getByRole("heading", { name: "Payment successful!" })).toBeInTheDocument();
  expect(screen.getByText("$145.30")).toBeInTheDocument();
  expect(screen.getByText("Order email: buyer@example.test")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Back to home" })).toHaveAttribute("href", "/");
  expect(screen.getByRole("link", { name: "Continue shopping" })).toHaveAttribute("href", "/products");
  expect(screen.getByRole("link", { name: "View order details" })).toHaveAttribute("href", `/orders/${query.data.id}`);
  expect(screen.queryByText(/sarah_chen|confirmation email has been sent/i)).not.toBeInTheDocument();
});

it("waits for current order data before showing the success details", () => {
  query.isPending = true;
  renderWithProviders(<PaymentSuccessScreen orderId={query.data.id} />);
  expect(screen.getByLabelText("Loading payment details")).toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: "Payment successful!" })).not.toBeInTheDocument();
});

it("allows retrying when the order cannot be loaded", async () => {
  query.isError = true;
  const user = userEvent.setup();
  renderWithProviders(<PaymentSuccessScreen orderId={query.data.id} />);
  expect(screen.getByRole("alert")).toHaveTextContent("We could not load payment details.");
  await user.click(screen.getByRole("button", { name: "Try again" }));
  expect(query.refetch).toHaveBeenCalledOnce();
});
