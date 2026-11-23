import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";
import { profileService } from "@/features/profile";

import { authService } from "../api/auth.service";
import { LoginForm } from "./login-form";

const { replaceMock } = vi.hoisted(() => ({ replaceMock: vi.fn() }));

vi.mock("@/i18n/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/i18n/navigation")>()),
  useRouter: () => ({ replace: replaceMock }),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    replaceMock.mockReset();
  });

  afterEach(() => vi.restoreAllMocks());

  it("hiển thị lỗi accessible khi submit dữ liệu rỗng", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);

    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByText("Please enter your email.")).toBeInTheDocument();
    expect(screen.getByLabelText("Email address *")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Password must be at least 8 characters.")).toBeInTheDocument();
  });

  it("gửi dữ liệu qua service và chuyển về trang chủ khi thành công", async () => {
    const loginSpy = vi.spyOn(authService, "login").mockResolvedValue({
      authenticated: true,
      expiresAt: "2099-08-21T12:00:00+00:00",
      mustChangePassword: false,
    });
    const profileSpy = vi.spyOn(profileService, "getCurrent").mockResolvedValue({
      fullName: "Example Name",
      phone: "+84901234567",
      email: "user@labdock.vn",
      companyName: "Example Company",
      companyPhone: "+84987654321",
      businessRegistrationNumber: "0123456789",
      deliveryAddress: "1 Nguyen Hue",
      postalCode: "700000",
      country: "VN",
      billingSameAsDelivery: true,
      billingAddress: { address: "1 Nguyen Hue", postalCode: "700000", country: "VN" },
      avatarUrl: "/media/public/profile.jpg",
      role: "unknown",
      joinedAt: "2026-08-21T10:00:00.000Z",
      lastActiveAt: null,
      passwordChangedAt: "2026-08-21T10:00:00.000Z",
    });
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);

    await user.type(screen.getByLabelText("Email address *"), "user@labdock.vn");
    await user.type(screen.getByLabelText("Password *"), "mat-khau-an-toan");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => {
      expect(loginSpy).toHaveBeenCalled();
      expect(loginSpy.mock.calls[0]?.[0]).toEqual({
        email: "user@labdock.vn",
        password: "mat-khau-an-toan",
      });
      expect(replaceMock).toHaveBeenCalledWith("/");
      expect(profileSpy).toHaveBeenCalledTimes(1);
    });
  });

  it("vẫn hoàn tất đăng nhập và chỉ gọi profile một lần khi profile lỗi", async () => {
    vi.spyOn(authService, "login").mockResolvedValue({
      authenticated: true,
      expiresAt: "2099-08-21T12:00:00+00:00",
      mustChangePassword: false,
    });
    const profileSpy = vi.spyOn(profileService, "getCurrent").mockRejectedValue(new Error("Profile unavailable"));
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);

    await user.type(screen.getByLabelText("Email address *"), "user@labdock.vn");
    await user.type(screen.getByLabelText("Password *"), "mat-khau-an-toan");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/");
      expect(profileSpy).toHaveBeenCalledTimes(1);
    });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
