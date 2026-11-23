import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import { LoginForm } from "@/features/auth/components/login-form";
import { cartService } from "@/features/checkout/api/cart.service";
import { CheckoutScreen } from "@/features/checkout/components/checkout-screen";
import { checkoutItems } from "@/features/checkout/data/checkout-data";
import { ContactForm } from "@/features/contact/components/contact-form";
import { ProfileForm } from "@/features/profile/components/profile-form";
import { ProfileSecurityCard } from "@/features/profile/components/profile-security-card";
import { profileService } from "@/features/profile";
import { profileFixture } from "@/features/profile/test/profile-fixture";

import { renderWithProviders } from "./render-with-providers";

vi.mock("@/i18n/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/i18n/navigation")>()),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

describe("Vietnamese form validation", () => {
  it("keeps login errors in Vietnamese", async () => {
    renderWithProviders(<LoginForm />, { locale: "vi" });
    await userEvent.setup().click(screen.getByRole("button", { name: "Đăng nhập" }));
    expect(await screen.findByText("Vui lòng nhập email.")).toBeInTheDocument();
    expect(screen.getByText("Mật khẩu phải có ít nhất 8 ký tự.")).toBeInTheDocument();
  });

  it("translates forgot-password email errors", async () => {
    renderWithProviders(<ForgotPasswordForm />, { locale: "vi" });
    await userEvent.setup().click(screen.getByRole("button", { name: "Gửi mã xác minh" }));
    expect(await screen.findByText("Vui lòng nhập địa chỉ email.")).toBeInTheDocument();
  });

  it("translates checkout delivery and billing errors", async () => {
    vi.spyOn(cartService, "get").mockResolvedValue(checkoutItems);
    vi.spyOn(profileService, "getCurrent").mockResolvedValue(profileFixture);
    renderWithProviders(<CheckoutScreen />, { locale: "vi" });
    const name = await screen.findByRole("textbox", { name: /Họ và tên/ });
    fireEvent.change(name, { target: { value: "A" } });
    await userEvent.setup().click(screen.getByRole("button", { name: "Thanh toán" }));
    expect(await screen.findByText("Vui lòng nhập họ và tên.")).toBeInTheDocument();
    expect(name).toHaveAttribute("aria-invalid", "true");
  });

  it("translates profile length limits", async () => {
    renderWithProviders(<ProfileForm user={profileFixture} onCancel={vi.fn()} />, { locale: "vi" });
    const name = screen.getByRole("textbox", { name: /Họ và tên/ });
    fireEvent.change(name, { target: { value: "A".repeat(81) } });
    await userEvent.setup().click(screen.getByRole("button", { name: "Lưu thay đổi" }));
    expect(await screen.findByText("Họ và tên không được vượt quá 80 ký tự.")).toBeInTheDocument();
    expect(name).toHaveAccessibleDescription(/Họ và tên không được vượt quá 80 ký tự/);
  });

  it("translates profile password errors", async () => {
    renderWithProviders(<ProfileSecurityCard passwordChangedAt={null} editing onEdit={vi.fn()} onCancel={vi.fn()} />, {
      locale: "vi",
    });
    await userEvent.setup().click(screen.getByRole("button", { name: "Lưu thay đổi" }));
    expect(await screen.findByText("Mật khẩu hiện tại phải có ít nhất 8 ký tự.")).toBeInTheDocument();
  });

  it("translates contact field and product errors", async () => {
    renderWithProviders(<ContactForm initialType="quote" />, { locale: "vi" });
    await userEvent.setup().click(screen.getByRole("button", { name: "Gửi" }));
    expect(await screen.findByText("Vui lòng nhập họ và tên.")).toBeInTheDocument();
    expect(screen.getByText("Vui lòng nhập số điện thoại hợp lệ.")).toBeInTheDocument();
    expect(screen.getByText("Vui lòng nhập tên sản phẩm.")).toBeInTheDocument();
    expect(screen.getByText("Vui lòng nhập số lượng hợp lệ.")).toBeInTheDocument();
  });
});
