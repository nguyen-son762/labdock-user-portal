import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { authService } from "@/features/auth/api/auth.service";
import { cartService } from "@/features/checkout/api/cart.service";
import { renderWithProviders } from "@/test/render-with-providers";

import { productFixture as product } from "../test/product-fixture";
import { ProductPurchasePanel } from "./product-purchase-panel";

const navigation = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("@/i18n/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/i18n/navigation")>()),
  useRouter: () => navigation,
}));

describe("ProductPurchasePanel", () => {
  beforeEach(() => {
    navigation.push.mockReset();
    vi.spyOn(authService, "getSession").mockResolvedValue({
      authenticated: true,
      expiresAt: "2099-01-01T00:00:00+00:00",
      mustChangePassword: false,
    });
  });

  it.each(["Buy now", "Add to cart"])("asks guests to log in when they click %s with hidden prices", async (action) => {
    vi.mocked(authService.getSession).mockResolvedValue({ authenticated: false });
    const add = vi.spyOn(cartService, "add");
    const user = userEvent.setup();
    renderWithProviders(<ProductPurchasePanel product={{ ...product, priceVisible: false }} />);
    const trigger = screen.getByRole("button", { name: action });

    await waitFor(() => expect(trigger).toBeEnabled());
    await user.click(trigger);

    const dialog = await screen.findByRole("dialog", { name: "Login required" });
    expect(dialog).toHaveAccessibleDescription("Please log in to add products to your cart or buy now.");
    expect(within(dialog).getByRole("link", { name: "Log in" })).toHaveAttribute("href", "/login");
    expect(add).not.toHaveBeenCalled();
    expect(navigation.push).not.toHaveBeenCalled();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("uses Vietnamese for the login notice and login link", async () => {
    vi.mocked(authService.getSession).mockResolvedValue({ authenticated: false });
    const user = userEvent.setup();
    renderWithProviders(<ProductPurchasePanel product={{ ...product, priceVisible: false }} />, { locale: "vi" });
    const trigger = screen.getByRole("button", { name: "Thêm vào giỏ hàng" });
    await waitFor(() => expect(trigger).toBeEnabled());
    await user.click(trigger);

    const dialog = await screen.findByRole("dialog", { name: "Yêu cầu đăng nhập" });
    expect(within(dialog).getByRole("link", { name: "Đăng nhập" })).toHaveAttribute("href", "/vi/login");
    await user.click(within(dialog).getByRole("button", { name: "Tiếp tục xem sản phẩm" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("requires guest authentication even when a product has a visible price", async () => {
    vi.mocked(authService.getSession).mockResolvedValue({ authenticated: false });
    const add = vi.spyOn(cartService, "add");
    const user = userEvent.setup();
    renderWithProviders(<ProductPurchasePanel product={product} />);
    const trigger = screen.getByRole("button", { name: "Buy now" });
    await waitFor(() => expect(trigger).toBeEnabled());
    await user.click(trigger);

    expect(await screen.findByRole("dialog", { name: "Login required" })).toBeInTheDocument();
    expect(add).not.toHaveBeenCalled();
    expect(navigation.push).not.toHaveBeenCalled();
  });

  it("keeps the quote contact flow available to guests", async () => {
    vi.mocked(authService.getSession).mockResolvedValue({ authenticated: false });
    const add = vi.spyOn(cartService, "add");
    const user = userEvent.setup();
    renderWithProviders(<ProductPurchasePanel product={product} />);

    await user.click(screen.getByRole("button", { name: "Request a quote" }));

    expect(navigation.push).toHaveBeenCalledWith(`/contact-us?type=quote&product=${product.slug}`);
    expect(add).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("adds the product and opens checkout for signed-in buyers", async () => {
    const variant = product.variants[0];
    if (!variant) throw new Error("Missing variant fixture");
    const add = vi.spyOn(cartService, "add").mockResolvedValue([
      {
        id: "cart-line",
        productId: product.id,
        variantId: variant.id,
        productName: product.name,
        sku: variant.sku,
        unitPrice: 100,
        quantity: 1,
      },
    ]);
    const user = userEvent.setup();
    renderWithProviders(<ProductPurchasePanel product={product} />);
    await waitFor(() => expect(screen.getByRole("button", { name: "Buy now" })).toBeEnabled());
    await user.click(screen.getByRole("button", { name: "Buy now" }));

    await waitFor(() => expect(navigation.push).toHaveBeenCalledWith("/checkout?items=cart-line"));
    expect(add.mock.calls[0]?.[0]).toEqual({ variantId: variant.id, quantity: 1 });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("adds the variant selected from the API payload to cart", async () => {
    const addSpy = vi.spyOn(cartService, "add").mockResolvedValue([]);
    const user = userEvent.setup();
    renderWithProviders(<ProductPurchasePanel product={product} />);

    await user.click(screen.getByRole("button", { name: "200ml" }));
    expect(screen.getByText("$180.00")).toBeInTheDocument();
    expect(screen.getByText("$200.00")).toHaveClass("line-through");
    expect(screen.getByText("-10%")).toBeInTheDocument();
    expect(screen.getByText("DEU")).toHaveAttribute("title", "Germany");
    expect(screen.queryByText("SUPPLIER-001")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Add to cart" }));

    expect(addSpy.mock.calls[0]?.[0]).toEqual({ variantId: "55555555-5555-5555-5555-555555555555", quantity: 1 });
    expect(await screen.findByText(`${product.name} added to cart.`)).toBeInTheDocument();
    expect(screen.getByText("ISO 27001")).toBeInTheDocument();
  });

  it("links to login and hides promotions for hidden or missing prices", () => {
    renderWithProviders(
      <ProductPurchasePanel
        product={{
          ...product,
          priceVisible: false,
          variants: [{ ...product.variants[1]!, unitPrice: null, rfqBasePrice: null }],
        }}
      />,
    );

    expect(screen.getByRole("link", { name: "Login to view Price" })).toHaveAttribute("href", "/login");
    expect(screen.queryByText("-10%")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Buy now" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Add to cart" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Request a quote" })).toBeEnabled();
  });

  it("shows the out-of-stock message below quantity instead of inside the variant button", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <ProductPurchasePanel
        product={{ ...product, variants: [product.variants[0]!, { ...product.variants[1]!, stockQty: 0 }] }}
      />,
    );

    expect(screen.queryByText("This option is out of stock.")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "200ml" }));
    expect(screen.getByRole("button", { name: "200ml" })).toHaveTextContent(/^200ml$/);
    expect(screen.getByText("This option is out of stock.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add to cart" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "100ml" }));
    expect(screen.queryByText("This option is out of stock.")).not.toBeInTheDocument();
  });

  it("warns and blocks purchase when the typed quantity exceeds the variant stock", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProductPurchasePanel product={product} />);
    const input = screen.getByRole("textbox", { name: "Quantity" });

    await user.clear(input);
    await user.type(input, "11");
    expect(screen.getByText("The quantity exceeds the available stock")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add to cart" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Buy now" })).toBeDisabled();

    await user.clear(input);
    await user.type(input, "10");
    expect(screen.queryByText("The quantity exceeds the available stock")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add to cart" })).toBeEnabled();
  });
});
