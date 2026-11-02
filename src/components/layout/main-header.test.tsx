import { act, fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { MainHeader } from "./main-header";

const navigation = vi.hoisted(() => ({ replace: vi.fn() }));

vi.mock("next/navigation", () => ({
  permanentRedirect: vi.fn(),
  redirect: vi.fn(),
  useParams: () => ({}),
  usePathname: () => "/cart",
  useRouter: () => navigation,
}));

describe("MainHeader", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders account state from session data instead of the pathname", () => {
    const { rerender } = renderWithProviders(<MainHeader />);
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/login");
    expect(screen.queryByText("Orders")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Cart" })).not.toBeInTheDocument();

    rerender(<MainHeader account={{ fullName: "Sarah Chen", email: "sarah@example.com" }} />);
    expect(screen.getByRole("link", { name: "My profile" })).toHaveAttribute("href", "/profile");
    expect(screen.getByText("Sarah Chen")).toBeInTheDocument();
    expect(screen.getByText("Orders")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Cart" })).toHaveAttribute("href", "/cart");

    rerender(<MainHeader account={{ fullName: "Sarah Chen", email: "sarah@example.com" }} isAuthenticated={false} />);
    expect(screen.queryByText("Orders")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Cart" })).not.toBeInTheDocument();
  });

  it("switches locale while preserving the current pathname", async () => {
    const user = userEvent.setup();
    renderWithProviders(<MainHeader />);

    await user.click(screen.getByRole("button", { name: "Language" }));
    await user.click(screen.getByRole("button", { name: /Tiếng Việt/ }));

    expect(navigation.replace).toHaveBeenCalledWith("/vi/cart");
  });

  it("opens child categories in a horizontal panel on hover", async () => {
    vi.useFakeTimers();
    renderWithProviders(
      <MainHeader
        categories={[
          {
            id: "root",
            name: "Mice Level 1",
            slug: "mice-level-1",
            productCount: 3,
            children: [
              {
                id: "child",
                name: "Mice Level 2",
                slug: "mice-level-2",
                productCount: 1,
                children: [],
              },
            ],
          },
        ]}
      />,
    );

    const categoryTrigger = screen.getByRole("button", { name: "All Categories" });
    fireEvent.mouseEnter(categoryTrigger);
    act(() => vi.advanceTimersByTime(199));
    expect(screen.queryByRole("navigation", { name: "Product categories" })).not.toBeInTheDocument();

    act(() => vi.advanceTimersByTime(1));

    expect(screen.getByRole("link", { name: /Mice Level 1/ })).toHaveAttribute(
      "href",
      "/products/category/mice-level-1",
    );
    expect(screen.queryByRole("link", { name: /Mice Level 2/ })).not.toBeInTheDocument();

    const rootCategory = screen.getByRole("link", { name: /Mice Level 1/ });
    const categoryNavigation = screen.getByRole("navigation", { name: "Product categories" });
    fireEvent.mouseLeave(categoryTrigger);
    fireEvent.mouseEnter(categoryNavigation);
    fireEvent.mouseEnter(rootCategory);

    expect(screen.getByRole("link", { name: /Mice Level 2/ })).toHaveAttribute(
      "href",
      "/products/category/mice-level-2",
    );
    expect(screen.getByRole("region", { name: "Subcategories of Mice Level 1" })).toBeInTheDocument();

    fireEvent.mouseLeave(categoryNavigation);
    act(() => vi.advanceTimersByTime(349));
    expect(screen.getByRole("navigation", { name: "Product categories" })).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByRole("navigation", { name: "Product categories" })).not.toBeInTheDocument();
  });

  it("opens child categories from the accessible disclosure button", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <MainHeader
        categories={[
          {
            id: "root",
            name: "Mice Level 1",
            slug: "mice-level-1",
            children: [{ id: "child", name: "Mice Level 2", slug: "mice-level-2", children: [] }],
          },
        ]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "All Categories" }));
    const disclosure = screen.getByRole("button", { name: "Open subcategories for Mice Level 1" });
    expect(disclosure).toHaveAttribute("aria-expanded", "false");

    await user.click(disclosure);

    expect(disclosure).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "Mice Level 2" })).toBeInTheDocument();
  });
  it("LOC-003 preserves both query and fragment while switching locale", async () => {
    const user = userEvent.setup();
    window.history.replaceState(null, "", "/cart?items=I1#cart-products");
    try {
      renderWithProviders(<MainHeader />);
      await user.click(screen.getByRole("button", { name: "Language" }));
      await user.click(screen.getByRole("button", { name: /Tiếng Việt/ }));
      expect(navigation.replace).toHaveBeenCalledWith("/vi/cart?items=I1#cart-products");
    } finally {
      window.history.replaceState(null, "", "/");
    }
  });
});
