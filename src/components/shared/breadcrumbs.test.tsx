import { screen, within } from "@testing-library/react";

import { renderWithProviders } from "@/test/render-with-providers";

import { Breadcrumbs } from "./breadcrumbs";

it.each([
  { locale: "vi" as const, label: "Đường dẫn", home: "Trang chủ", products: "Sản phẩm", prefix: "/vi" },
  { locale: "en" as const, label: "Breadcrumb", home: "Home", products: "Products", prefix: "" },
])("keeps $locale in breadcrumb navigation", ({ locale, label, home, products, prefix }) => {
  renderWithProviders(
    <Breadcrumbs items={[{ label: home, href: "/" }, { label: products, href: "/products" }, { label: "Flask" }]} />,
    { locale },
  );

  const breadcrumb = within(screen.getByRole("navigation", { name: label }));
  expect(breadcrumb.getByRole("link", { name: home })).toHaveAttribute("href", prefix || "/");
  expect(breadcrumb.getByRole("link", { name: products })).toHaveAttribute("href", `${prefix}/products`);
  expect(breadcrumb.getByText("Flask")).toHaveAttribute("aria-current", "page");
});
