import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";
import { parseProductCatalogFilters } from "../schemas/product-catalog.schema";
import { CatalogFilters } from "./catalog-filters";

const brands = Array.from({ length: 6 }, (_, index) => ({
  id: `11111111-1111-1111-1111-${String(index + 1).padStart(12, "0")}`,
  name: `Brand ${index + 1}`,
}));
const props = {
  brands,
  origins: [],
  filters: parseProductCatalogFilters({}),
  disabled: false,
  originsError: false,
  brandsError: false,
  onBrandChange: vi.fn(),
  onOriginsChange: vi.fn(),
  onClear: vi.fn(),
};

describe("CatalogFilters brands", () => {
  it("shows five checkboxes, expands the list and searches hidden brands", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CatalogFilters {...props} />);
    expect(screen.queryByText("All brands")).not.toBeInTheDocument();
    expect(screen.getAllByRole("checkbox")).toHaveLength(5);
    await user.click(screen.getByRole("button", { name: "See more 1 brand" }));
    expect(screen.getAllByRole("checkbox")).toHaveLength(6);
    await user.click(screen.getByRole("button", { name: "See less" }));
    await user.type(screen.getByRole("textbox", { name: "Search brands" }), "Brand 6");
    expect(screen.getAllByRole("checkbox")).toHaveLength(1);
    expect(screen.getByRole("checkbox", { name: "Brand 6" })).toBeInTheDocument();
  });

  it("adds another brand and allows deselecting a selected brand", async () => {
    const user = userEvent.setup();
    const first = brands[0];
    const second = brands[1];
    if (!first || !second) throw new Error("Missing brand fixture");
    const onBrandChange = vi.fn();
    renderWithProviders(
      <CatalogFilters
        {...props}
        onBrandChange={onBrandChange}
        filters={parseProductCatalogFilters({ brandIds: first.id })}
      />,
    );
    expect(screen.getByRole("checkbox", { name: first.name })).toBeChecked();
    await user.click(screen.getByRole("checkbox", { name: second.name }));
    expect(onBrandChange).toHaveBeenLastCalledWith([first.id, second.id]);
    await user.click(screen.getByRole("checkbox", { name: first.name }));
    expect(onBrandChange).toHaveBeenLastCalledWith([]);
  });

  it("collapses brands independently and preserves selections when reopened", async () => {
    const user = userEvent.setup();
    const first = brands[0];
    if (!first) throw new Error("Missing brand fixture");
    const onBrandChange = vi.fn();
    renderWithProviders(
      <CatalogFilters
        {...props}
        origins={["SG"]}
        onBrandChange={onBrandChange}
        filters={parseProductCatalogFilters({ brandIds: first.id })}
      />,
    );
    const toggle = screen.getByRole("button", { name: "Brands" });
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("checkbox", { name: first.name })).not.toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Singapore" })).toBeVisible();
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("checkbox", { name: first.name })).toBeChecked();
    expect(onBrandChange).not.toHaveBeenCalled();
  });

  it("hides See more for at most five brands", () => {
    renderWithProviders(<CatalogFilters {...props} brands={brands.slice(0, 5)} />);
    expect(screen.queryByRole("button", { name: /See more/ })).not.toBeInTheDocument();
  });
});
