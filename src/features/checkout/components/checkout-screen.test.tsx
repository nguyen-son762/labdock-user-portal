import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";
import { profileService } from "@/features/profile";

import { checkoutService } from "../api/checkout.service";
import { cartService } from "../api/cart.service";
import type { CheckoutSession } from "../checkout.types";
import { checkoutItems } from "../data/checkout-data";
import { checkoutSessionFixture } from "../test/checkout-session.fixture";
import { checkoutSessionStorage } from "../utils/checkout-session-storage";
import { CheckoutScreen } from "./checkout-screen";

const navigation = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("@/i18n/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/i18n/navigation")>()),
  useRouter: () => navigation,
}));

describe("CheckoutScreen", () => {
  beforeEach(() => {
    navigation.push.mockReset();
    checkoutSessionStorage.clear();
    vi.restoreAllMocks();
    vi.spyOn(cartService, "get").mockResolvedValue(checkoutItems);
    vi.spyOn(profileService, "getCurrent").mockRejectedValue(new Error("No profile fixture"));
  });

  it("prevents duplicate checkout submits while payment is being prepared", async () => {
    const user = userEvent.setup();
    let resolveCheckout: ((session: CheckoutSession) => void) | undefined;
    const request = new Promise<CheckoutSession>((resolve) => {
      resolveCheckout = resolve;
    });
    const createSpy = vi.spyOn(checkoutService, "create").mockReturnValue(request);

    renderWithProviders(<CheckoutScreen initialItemIds={[checkoutItems[0]!.id]} />);
    const submit = await screen.findByRole("button", { name: "Make payment" });
    expect(screen.getByRole("radio", { name: "Bank transfer" })).toBeChecked();
    expect(screen.queryByRole("radio", { name: /PayNow/ })).not.toBeInTheDocument();
    await user.type(screen.getByRole("textbox", { name: "Full name *" }), "QA Tester");
    await user.type(screen.getByRole("textbox", { name: "Email address *" }), "qa@example.test");
    await user.type(screen.getByRole("textbox", { name: "Phone no. *" }), "88009900");
    await user.type(screen.getByRole("textbox", { name: "Address *" }), "123 Test Street");
    await user.type(screen.getByRole("textbox", { name: "City *" }), "Singapore");
    await user.type(screen.getByRole("textbox", { name: "Notes" }), "Call on arrival");
    await user.click(submit);
    await user.click(submit);

    expect(createSpy).toHaveBeenCalledTimes(1);
    expect(submit).toBeDisabled();

    resolveCheckout?.(checkoutSessionFixture);
    await waitFor(() =>
      expect(navigation.push).toHaveBeenCalledWith("/payment?orderId=11111111-1111-1111-1111-111111111111"),
    );
    expect(submit).toBeDisabled();
    expect(checkoutSessionStorage.get(checkoutSessionFixture.orderId)).toEqual(checkoutSessionFixture);
    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        items: [checkoutItems[0]],
        checkout: expect.objectContaining({
          city: "Singapore",
          notes: "Call on arrival",
          paymentMethod: "bank-transfer",
        }),
      }),
      expect.anything(),
    );
  });
  it("CHK-005 starts with blank identity fields when no profile is available", async () => {
    renderWithProviders(<CheckoutScreen />);
    expect(await screen.findByRole("textbox", { name: "Full name *" })).toHaveValue("");
    expect(screen.getByRole("textbox", { name: "Email address *" })).toHaveValue("");
  });
});
