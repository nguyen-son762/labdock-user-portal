import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { cartService } from "../api/cart.service";
import { checkoutItems } from "../data/checkout-data";
import { CartHeaderPopover } from "./cart-header-popover";

describe("CartHeaderPopover", () => {
  it("removes products through the shared cart service", async () => {
    vi.spyOn(cartService, "get").mockResolvedValueOnce(checkoutItems).mockResolvedValue(checkoutItems.slice(1));
    const removeSpy = vi.spyOn(cartService, "remove").mockResolvedValue();
    const user = userEvent.setup();
    renderWithProviders(<CartHeaderPopover />);

    await user.click(await screen.findByRole("button", { name: "Cart with 2 products" }));
    await user.click(screen.getByRole("button", { name: `Remove ${checkoutItems[0]?.productName}` }));

    expect(removeSpy).toHaveBeenCalledWith({ itemId: checkoutItems[0]?.id }, expect.anything());
    expect(await screen.findByRole("button", { name: "Cart with 1 products" })).toBeInTheDocument();
  });

  it("opens the cart shortcuts from the compact mobile trigger and closes after navigating", async () => {
    vi.spyOn(cartService, "get").mockResolvedValue(checkoutItems);
    const user = userEvent.setup();
    renderWithProviders(<CartHeaderPopover variant="compact" />);

    await user.click(await screen.findByRole("button", { name: "Cart, 2 items" }));
    expect(screen.getByRole("link", { name: "View cart" })).toHaveAttribute("href", "/cart");
    expect(screen.getByRole("link", { name: "View orders" })).toHaveAttribute("href", "/orders");

    await user.click(screen.getByRole("link", { name: "View orders" }));
    await waitFor(() => expect(screen.queryByRole("link", { name: "View cart" })).not.toBeInTheDocument());
  });
});
