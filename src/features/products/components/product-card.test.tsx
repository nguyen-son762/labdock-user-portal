import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AxiosError } from "axios";
import { toast } from "sonner";

import { Toaster } from "@/components/ui/sonner";
import { renderWithProviders } from "@/test/render-with-providers";

import { authService } from "@/features/auth/api/auth.service";
import { cartService } from "@/features/checkout/api/cart.service";

import type { Product } from "../products.types";
import { productsService } from "../api/products.service";
import { ProductCard } from "./product-card";

const SIGNED_IN_SESSION = {
  authenticated: true,
  expiresAt: "2099-01-01T00:00:00+00:00",
  mustChangePassword: false,
} as const;

const product: Product = {
  id: "11111111-1111-1111-1111-111111111111",
  name: "Round Bottom Flask",
  slug: "round-bottom-flask",
  productNo: "BK-00120",
  status: "Published",
  brandName: "Medisafe",
  notes: "",
  description: "Laboratory flask",
  specialRequirement: false,
  restrictedCondition: false,
  priceVisible: true,
  casNumber: "",
  specifications: [],
  variants: [
    {
      id: "22222222-2222-2222-2222-222222222222",
      sku: "BK-00120-50ML",
      priceVisible: true,
      unitPrice: 1000,
      rfqBasePrice: 1000,
      promotionPercent: 0,
      currency: "SGD",
      stockQty: 10,
      isActive: true,
      selections: [
        {
          attributeId: "33333333-3333-3333-3333-333333333333",
          attributeCode: "size",
          attributeName: "Size",
          valueId: "44444444-4444-4444-4444-444444444444",
          valueCode: "50ml",
          value: "50ml",
        },
      ],
    },
  ],
  media: [
    {
      id: "55555555-5555-5555-5555-555555555555",
      url: "/home/product-flask-round.png",
      contentType: "image/png",
      sortOrder: 0,
      isPrimary: true,
    },
  ],
  documents: [],
  references: [],
  related: [],
  certificates: [],
  isNew: true,
  isOutstanding: false,
};

describe("ProductCard", () => {
  beforeEach(() => {
    vi.spyOn(productsService, "getBySlug").mockResolvedValue(product);
  });
  afterEach(() => {
    act(() => {
      toast.dismiss();
    });
  });
  it("links an available product to its detail page", () => {
    renderWithProviders(<ProductCard product={product} />);
    expect(screen.getByRole("link", { name: `Buy now: ${product.name}` })).toHaveAttribute(
      "href",
      "/products/round-bottom-flask",
    );
    expect(screen.getByText(product.brandName)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: `Add ${product.name} to cart` })).toBeInTheDocument();
  });

  it("shows learn more and hides cart for out of stock products", () => {
    renderWithProviders(
      <ProductCard
        product={{ ...product, variants: product.variants.map((variant) => ({ ...variant, stockQty: 0 })) }}
      />,
    );
    expect(screen.getByRole("link", { name: `Learn more: ${product.name}` })).toHaveAttribute(
      "href",
      "/products/round-bottom-flask",
    );
    expect(screen.queryByRole("button", { name: `Add ${product.name} to cart` })).not.toBeInTheDocument();
  });

  it("asks guests to log in instead of showing contact pricing when the price is hidden", async () => {
    vi.spyOn(authService, "getSession").mockResolvedValue({ authenticated: false });
    renderWithProviders(<ProductCard product={{ ...product, priceVisible: false }} />);

    expect(await screen.findByRole("link", { name: "Login to view Price" })).toHaveAttribute("href", "/login");
    expect(screen.queryByText("Contact for price")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: `Add ${product.name} to cart` })).not.toBeInTheDocument();
  });

  it("shows contact pricing and hides cart for signed-in users when the API price is not visible", async () => {
    vi.spyOn(authService, "getSession").mockResolvedValue(SIGNED_IN_SESSION);
    renderWithProviders(<ProductCard product={{ ...product, priceVisible: false }} />);

    expect(await screen.findByText("Contact for price")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Login to view Price" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: `Learn more: ${product.name}` })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: `Add ${product.name} to cart` })).not.toBeInTheDocument();
  });

  it("loads detail and adds its first variant instead of the variant from the product card", async () => {
    const addSpy = vi.spyOn(cartService, "add").mockResolvedValue([]);
    const firstVariantId = "66666666-6666-6666-6666-666666666666";
    vi.mocked(productsService.getBySlug).mockResolvedValue({
      ...product,
      variants: [
        { ...product.variants[0]!, id: firstVariantId },
        { ...product.variants[0]!, id: "77777777-7777-7777-7777-777777777777", unitPrice: 1 },
      ],
    });
    const user = userEvent.setup();
    renderWithProviders(
      <>
        <ProductCard product={product} />
        <Toaster />
      </>,
    );

    await user.click(screen.getByRole("button", { name: `Add ${product.name} to cart` }));

    expect(productsService.getBySlug).toHaveBeenCalledExactlyOnceWith(product.slug);
    expect(addSpy.mock.calls[0]?.[0]).toEqual({ variantId: firstVariantId, quantity: 1 });
    expect(screen.getByText("$1,000.00")).toBeInTheDocument();
    expect(await screen.findByText(`${product.name} added to cart.`)).toBeVisible();
  });

  it("shows a visible error toast when adding to the cart fails", async () => {
    vi.spyOn(cartService, "add").mockRejectedValue(new AxiosError("Network error", "ERR_NETWORK"));
    const user = userEvent.setup();
    renderWithProviders(
      <>
        <ProductCard product={product} />
        <Toaster />
      </>,
    );

    await user.click(screen.getByRole("button", { name: `Add ${product.name} to cart` }));

    expect(await screen.findByText("We could not update your cart.")).toBeVisible();
    expect(screen.getByText("Unable to connect to the system. Please try again later.")).toBeVisible();
    expect(screen.queryByText(`${product.name} added to cart.`)).not.toBeInTheDocument();
  });

  it("sends one request and waits for the API before reporting success", async () => {
    let finishDetail: ((value: Product) => void) | undefined;
    vi.mocked(productsService.getBySlug).mockReturnValue(
      new Promise((resolve) => {
        finishDetail = resolve;
      }),
    );
    let finish: ((items: []) => void) | undefined;
    const addSpy = vi.spyOn(cartService, "add").mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    const user = userEvent.setup();
    renderWithProviders(
      <>
        <ProductCard product={product} />
        <Toaster />
      </>,
    );
    const button = screen.getByRole("button", { name: `Add ${product.name} to cart` });

    await user.click(button);
    await user.click(button);

    expect(productsService.getBySlug).toHaveBeenCalledOnce();
    expect(addSpy).not.toHaveBeenCalled();
    expect(button).toBeDisabled();
    finishDetail?.(product);
    await waitFor(() => expect(addSpy).toHaveBeenCalledOnce());
    expect(button).toBeDisabled();
    expect(screen.queryByText(`${product.name} added to cart.`)).not.toBeInTheDocument();
    finish?.([]);
    expect(await screen.findByText(`${product.name} added to cart.`)).toBeVisible();
    await waitFor(() => expect(button).toBeEnabled());
  });

  it.each(["failed", "no variants"])("does not add to cart when detail loading has %s", async (reason) => {
    if (reason === "failed") {
      vi.mocked(productsService.getBySlug).mockRejectedValue(new AxiosError("Network error", "ERR_NETWORK"));
    } else {
      vi.mocked(productsService.getBySlug).mockResolvedValue({ ...product, variants: [] });
    }
    const addSpy = vi.spyOn(cartService, "add");
    const user = userEvent.setup();
    renderWithProviders(
      <>
        <ProductCard product={product} />
        <Toaster />
      </>,
    );

    await user.click(screen.getByRole("button", { name: `Add ${product.name} to cart` }));

    expect(await screen.findByText("We could not update your cart.")).toBeVisible();
    expect(addSpy).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: `Add ${product.name} to cart` })).toBeEnabled();
  });
});
