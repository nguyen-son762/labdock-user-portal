import { screen, within } from "@testing-library/react";

import { renderWithProviders } from "@/test/render-with-providers";

import { SiteFooter } from "./site-footer";

it("translates the footer payment labels into Vietnamese", () => {
  renderWithProviders(<SiteFooter />, { locale: "vi" });

  const methods = within(screen.getByLabelText("Phương thức thanh toán được chấp nhận"));
  expect(methods.getByRole("img", { name: "Thẻ Visa" })).toBeInTheDocument();
  expect(methods.getByRole("img", { name: "Thanh toán qua PayNow" })).toBeInTheDocument();
  expect(methods.getByRole("img", { name: "Thẻ Mastercard" })).toBeInTheDocument();
});
