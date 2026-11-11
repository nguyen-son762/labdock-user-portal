import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import type { Product } from "../products.types";
import { ProductInformation } from "./product-information";

const product: Product = {
  id: "11111111-1111-1111-1111-111111111111",
  name: "Example Product",
  slug: "example-product",
  productNo: "SKU-001",
  status: "Published",
  brandName: "Example Brand",
  notes: "",
  description: "Product description from the API.",
  specialRequirement: false,
  restrictedCondition: false,
  priceVisible: true,
  casNumber: "64-17-5",
  specifications: [{ name: "Purity", value: "99%" }],
  variants: [],
  media: [],
  documents: [
    {
      id: "22222222-2222-2222-2222-222222222222",
      displayName: "Safety sheet",
      contentType: "application/pdf",
      sizeBytes: 1024,
      sortOrder: 0,
      createdAt: "2026-08-21T10:00:00+00:00",
      url: "/media/public/safety-sheet.pdf",
    },
  ],
  references: [
    {
      id: "33333333-3333-3333-3333-333333333333",
      title: "PubChem entry",
      url: "https://pubchem.ncbi.nlm.nih.gov/compound/5280723",
      sortOrder: 1,
    },
    {
      id: "44444444-4444-4444-4444-444444444444",
      title: "Unsafe link",
      url: "javascript:alert(1)",
      sortOrder: 0,
    },
  ],
  related: [],
  certificates: [],
  isNew: false,
  isOutstanding: false,
};

describe("ProductInformation", () => {
  it("renders API specifications and product documents", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProductInformation product={product} descriptionHtml={product.description} />);

    expect(screen.getByText("Purity")).toBeInTheDocument();
    expect(screen.getByText("99%")).toBeInTheDocument();

    const specificationsTab = screen.getByRole("tab", { name: "Specifications" });
    specificationsTab.focus();
    await user.keyboard("{ArrowRight}");

    expect(screen.getByRole("tab", { name: "References" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("link", { name: /Safety sheet/ })).toHaveAttribute(
      "href",
      "https://uat-api-labdock.365studio.vn/media/public/safety-sheet.pdf",
    );
    expect(screen.getByRole("link", { name: /PubChem entry/ })).toHaveAttribute(
      "href",
      "https://pubchem.ncbi.nlm.nih.gov/compound/5280723",
    );
    expect(screen.queryByRole("link", { name: /Unsafe link/ })).not.toBeInTheDocument();
  });

  it("shows the empty state only when there are no references or documents", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <ProductInformation
        product={{ ...product, documents: [], references: [] }}
        descriptionHtml={product.description}
      />,
    );
    await user.click(screen.getByRole("tab", { name: "References" }));
    expect(screen.getByText("No product documents are available.")).toBeVisible();
  });

  it("renders references when the product has no documents", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <ProductInformation product={{ ...product, documents: [] }} descriptionHtml={product.description} />,
    );
    await user.click(screen.getByRole("tab", { name: "References" }));
    expect(screen.getByRole("link", { name: /PubChem entry/ })).toHaveAttribute("target", "_blank");
    expect(screen.queryByText("No product documents are available.")).not.toBeInTheDocument();
  });
  it("PDP-020 SEO-008 renders every tab panel and preserves its accessible relationship", () => {
    renderWithProviders(<ProductInformation product={product} descriptionHtml={product.description} />);
    for (const tab of screen.getAllByRole("tab")) {
      const panelId = tab.getAttribute("aria-controls");
      expect(panelId).not.toBeNull();
      expect(document.getElementById(panelId ?? "")).toBeInTheDocument();
    }
    expect(document.getElementById("product-panel-description")).toHaveTextContent(product.description);
  });
});
