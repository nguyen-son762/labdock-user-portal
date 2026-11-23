import { screen, within } from "@testing-library/react";
import type { ReactNode } from "react";

import { authService } from "@/features/auth/api/auth.service";
import { renderWithProviders } from "@/test/render-with-providers";

import { productFixture } from "../test/product-fixture";
import { ProductDetailScreen } from "./product-detail-screen";

vi.mock("swiper/react", () => ({
  Swiper: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SwiperSlide: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/i18n/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/i18n/navigation")>()),
  useRouter: () => ({ push: vi.fn() }),
}));

it("keeps product breadcrumbs, related products, and payment descriptions in Vietnamese", () => {
  vi.spyOn(authService, "getSession").mockResolvedValue({ authenticated: false });
  renderWithProviders(
    <ProductDetailScreen
      product={{
        ...productFixture,
        related: [
          {
            id: "related-product",
            name: "Related Flask",
            slug: "related-flask",
            primaryImageUrl: "/flask.png",
            priceVisible: false,
            fromPrice: null,
            currency: "SGD",
          },
        ],
      }}
    />,
    { locale: "vi" },
  );

  const breadcrumb = within(screen.getByRole("navigation", { name: "Đường dẫn" }));
  expect(breadcrumb.getByRole("link", { name: "Trang chủ" })).toHaveAttribute("href", "/vi");
  expect(breadcrumb.getByRole("link", { name: "Sản phẩm" })).toHaveAttribute("href", "/vi/products");
  expect(screen.getByRole("heading", { name: "Sản phẩm liên quan" })).toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: "Related Products" })).not.toBeInTheDocument();
  const paymentMethods = within(screen.getByLabelText("Phương thức thanh toán được chấp nhận"));
  expect(paymentMethods.getByRole("img", { name: "Thẻ Visa" })).toBeInTheDocument();
  expect(paymentMethods.getByRole("img", { name: "Thanh toán qua PayNow" })).toBeInTheDocument();
  expect(paymentMethods.getByRole("img", { name: "Thẻ Mastercard" })).toBeInTheDocument();
});
