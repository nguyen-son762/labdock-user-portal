import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { cartService } from "@/features/checkout/api/cart.service";
import { renderWithProviders } from "@/test/render-with-providers";

import { productFixture as product } from "../test/product-fixture";
import { ProductPurchasePanel } from "./product-purchase-panel";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  useRouter: () => ({ push: vi.fn() }),
}));

describe("ProductPurchasePanel", () => {
  it("adds the variant selected from the API payload to cart", async () => {
    const addSpy = vi.spyOn(cartService, "add").mockResolvedValue([]);
    const user = userEvent.setup();
    renderWithProviders(<ProductPurchasePanel product={product} />);

    await user.click(screen.getByRole("button", { name: "200ml" }));
    expect(screen.getByText("$180.00")).toBeInTheDocument();
    expect(screen.getByText("$200.00")).toHaveClass("line-through");
    expect(screen.getByText("-10%")).toBeInTheDocument();
    expect(screen.getByText("Germany")).toBeInTheDocument();
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
