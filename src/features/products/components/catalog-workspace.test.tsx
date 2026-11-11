import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import type { ProductCatalogFilters } from "../schemas/product-catalog.schema";
import { mapPublicProduct } from "../utils/map-public-product";
import { CatalogWorkspace } from "./catalog-workspace";

const routerReplace = vi.hoisted(() => vi.fn());
const searchQuery = vi.hoisted(() => ({ value: "" }));
const routerPush = vi.hoisted(() => vi.fn());
const categoryId = "22222222-2222-2222-2222-222222222222";
const brandId = "33333333-3333-3333-3333-333333333333";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(searchQuery.value),
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, ...props }: ComponentProps<"a"> & { href: string }) => <a href={href} {...props} />,
  usePathname: () => "/products",
  useRouter: () => ({ replace: routerReplace, push: routerPush }),
}));

vi.mock("./product-card", () => ({
  ProductCard: ({ product }: { product: { name: string } }) => <article>{product.name}</article>,
}));

vi.mock("./quote-card", () => ({ QuoteCard: () => <aside>Quote card</aside> }));

const product = mapPublicProduct({
  id: "11111111-1111-1111-1111-111111111111",
  name: "Example Product",
  slug: "example-product",
  productNo: "SKU-001",
  brandName: "Example Brand",
  primaryImageUrl: "/media/public/example.jpg",
  priceVisible: true,
  fromPrice: 99.5,
  currency: "SGD",
  outOfStock: false,
  promotionPercent: 0,
  publishedAt: "2026-08-21T10:00:00+00:00",
  isNew: true,
  isOutstanding: false,
});

const filters: ProductCatalogFilters = {
  page: 1,
  brandIds: [],
  categoryId,
  sort: "featured",
  origins: [],
};

beforeEach(() => {
  routerReplace.mockReset();
  routerPush.mockReset();
  searchQuery.value = `categoryId=${categoryId}`;
});

describe("CatalogWorkspace", () => {
  it("writes brand filters to the URL and preserves the selected category", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <CatalogWorkspace
        products={[product]}
        origins={["SG", "Germany"]}
        brands={[{ id: brandId, name: "Example Brand" }]}
        filters={filters}
        page={1}
        pageSize={20}
        total={40}
        productsError={false}
        originsError={false}
        brandsError={false}
      />,
    );

    await user.click(screen.getByLabelText("Example Brand"));

    expect(routerReplace).toHaveBeenCalledWith(`/products?categoryId=${categoryId}&brandIds=${brandId}`, {
      scroll: false,
    });
    expect(screen.getByRole("link", { name: "Page 2" })).toHaveAttribute(
      "href",
      `/products?categoryId=${categoryId}&page=2`,
    );
    expect(screen.getByRole("combobox", { name: "Sort products" })).toHaveTextContent("Sort by");
    await user.click(screen.getByRole("combobox", { name: "Sort products" }));
    await user.click(screen.getByRole("option", { name: "Name A-Z" }));
    expect(routerReplace).toHaveBeenLastCalledWith(`/products?categoryId=${categoryId}&sort=name`, {
      scroll: false,
    });
  });

  it("adds multiple brands, migrates legacy links and resets pagination", async () => {
    const user = userEvent.setup();
    const secondBrandId = "44444444-4444-4444-4444-444444444444";
    searchQuery.value = `categoryId=${categoryId}&brandId=${brandId}&sort=name&page=3`;
    renderWithProviders(
      <CatalogWorkspace
        products={[product]}
        origins={[]}
        brands={[
          { id: brandId, name: "Example Brand" },
          { id: secondBrandId, name: "Second Brand" },
        ]}
        filters={{ ...filters, brandIds: [brandId], sort: "name", page: 3 }}
        page={3}
        pageSize={20}
        total={60}
        productsError={false}
        originsError={false}
        brandsError={false}
      />,
    );
    await user.click(screen.getByRole("checkbox", { name: "Second Brand" }));
    expect(routerReplace).toHaveBeenCalledWith(
      `/products?categoryId=${categoryId}&sort=name&brandIds=${brandId}%2C${secondBrandId}`,
      { scroll: false },
    );
  });

  it("keeps product failures separate from available filters", () => {
    renderWithProviders(
      <CatalogWorkspace
        products={[]}
        origins={["SG", "Germany"]}
        brands={[{ id: brandId, name: "Example Brand" }]}
        filters={filters}
        page={1}
        pageSize={20}
        total={0}
        productsError
        originsError={false}
        brandsError={false}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("We could not load products");
    expect(screen.getByRole("group", { name: "Brands" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "SG" })).toBeEnabled();
    expect(screen.queryByRole("radiogroup", { name: "Categories" })).not.toBeInTheDocument();
  });

  it("adds and removes origins while preserving category, brand and sort, and resetting pagination", async () => {
    const user = userEvent.setup();
    searchQuery.value = `categoryId=${categoryId}&brandId=${brandId}&sort=name&origins=SG&page=3`;
    const selectedFilters = { ...filters, brandIds: [brandId], sort: "name" as const, origins: ["SG"], page: 3 };
    const props = {
      products: [product],
      origins: ["SG", "Germany"],
      brands: [{ id: brandId, name: "Example Brand" }],
      filters: selectedFilters,
      page: 3,
      pageSize: 20,
      total: 80,
      productsError: false,
      originsError: false,
      brandsError: false,
    };
    const { rerender } = renderWithProviders(<CatalogWorkspace {...props} />);
    await user.click(screen.getByRole("checkbox", { name: "Germany" }));
    const href = `/products?categoryId=${categoryId}&brandId=${brandId}&sort=name&origins=SG%2CGermany`;
    expect(routerReplace).toHaveBeenLastCalledWith(href, { scroll: false });
    expect(screen.getByRole("link", { name: "Page 2" })).toHaveAttribute(
      "href",
      `/products?categoryId=${categoryId}&brandId=${brandId}&sort=name&origins=SG&page=2`,
    );

    searchQuery.value = href.split("?")[1] ?? "";
    rerender(<CatalogWorkspace {...props} filters={{ ...selectedFilters, origins: ["SG", "Germany"], page: 1 }} />);
    await user.click(screen.getByRole("checkbox", { name: "SG" }));
    expect(routerReplace).toHaveBeenLastCalledWith(
      `/products?categoryId=${categoryId}&brandId=${brandId}&sort=name&origins=Germany`,
      { scroll: false },
    );
    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(routerReplace).toHaveBeenLastCalledWith("/products", { scroll: false });
  });

  it("clears the last origin and exposes clear filters in an empty result", async () => {
    const user = userEvent.setup();
    searchQuery.value = "origins=SG&page=2";
    renderWithProviders(
      <CatalogWorkspace
        products={[]}
        origins={["SG"]}
        brands={[]}
        filters={{ ...filters, categoryId: undefined, origins: ["SG"], page: 2 }}
        page={2}
        pageSize={20}
        total={0}
        productsError={false}
        originsError={false}
        brandsError={false}
      />,
    );
    expect(screen.getByRole("button", { name: "Clear filters" })).toBeInTheDocument();
    await user.click(screen.getByRole("checkbox", { name: "SG" }));
    expect(routerReplace).toHaveBeenLastCalledWith("/products", { scroll: false });
  });

  it("keeps products and brand filters usable when origins fail", () => {
    renderWithProviders(
      <CatalogWorkspace
        products={[product]}
        origins={[]}
        brands={[{ id: brandId, name: "Example Brand" }]}
        filters={filters}
        page={1}
        pageSize={20}
        total={1}
        productsError={false}
        originsError
        brandsError={false}
      />,
    );
    expect(screen.getByText("Example Product")).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Example Brand" })).toBeEnabled();
    expect(screen.getByRole("textbox", { name: "Search origins" })).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent("Unable to load origins");
  });
});
