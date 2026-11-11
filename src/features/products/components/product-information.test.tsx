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
