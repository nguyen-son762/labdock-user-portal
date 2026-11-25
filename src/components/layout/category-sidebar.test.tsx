import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { CategoryPopover, type HeaderCategory } from "./category-popover";

const categories: HeaderCategory[] = [
  {
    id: "animals",
    name: "Animal Biologicals",
    slug: "animal-biologicals",
    productCount: 1,
    children: [
      { id: "lysates", name: "Animal Lysates", slug: "animal-lysates", productCount: 0, children: [] },
      { id: "plasma", name: "Animal Plasma", slug: "animal-plasma", productCount: 0, children: [] },
    ],
  },
  { id: "bedding", name: "Bedding Systems", slug: "bedding-systems", productCount: 0, children: [] },
];

describe("CategoryPopover compact sidebar", () => {
  it("drills into subcategories in a left drawer and returns to the root list", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CategoryPopover categories={categories} compact />);

    await user.click(screen.getByRole("button", { name: "Open categories" }));
    const drawer = screen.getByRole("dialog", { name: "Shop by categories" });
    expect(within(drawer).getByRole("link", { name: /Bedding Systems/ })).toHaveAttribute(
      "href",
      "/products/category/bedding-systems",
    );

    await user.click(within(drawer).getByRole("button", { name: "Open subcategories for Animal Biologicals" }));
    expect(screen.getByRole("dialog", { name: "Animal Biologicals" })).toBeInTheDocument();
    expect(within(drawer).getByRole("link", { name: "View all Animal Biologicals" })).toHaveAttribute(
      "href",
      "/products/category/animal-biologicals",
    );
    expect(within(drawer).getByRole("link", { name: /Animal Plasma/ })).toBeInTheDocument();
    expect(within(drawer).queryByRole("link", { name: /Bedding Systems/ })).not.toBeInTheDocument();

    await user.click(within(drawer).getByRole("button", { name: "Back to Shop by categories" }));
    expect(screen.getByRole("dialog", { name: "Shop by categories" })).toBeInTheDocument();

    await user.click(within(drawer).getByRole("button", { name: "Close categories" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
});
