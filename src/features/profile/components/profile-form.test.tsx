import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithProviders } from "@/test/render-with-providers";

import { profileService } from "../api/profile.service";
import { profileFixture as profile } from "../test/profile-fixture";
import { ProfileScreen } from "./profile-screen";

const locales = [
  {
    locale: "en",
    edit: "Edit",
    checkbox: "Same as delivery address",
    address: "Billing address *",
    postal: "Billing postal code *",
    country: "Billing country *",
    search: "Search country or code",
    save: "Save changes",
    cancel: "Cancel",
    success: "Profile updated.",
    required: "Enter a complete billing address.",
  },
  {
    locale: "vi",
    edit: "Chỉnh sửa",
    checkbox: "Giống địa chỉ giao hàng",
    address: "Địa chỉ thanh toán *",
    postal: "Mã bưu chính thanh toán *",
    country: "Quốc gia thanh toán *",
    search: "Tìm quốc gia hoặc mã gọi",
    save: "Lưu thay đổi",
    cancel: "Hủy",
    success: "Đã cập nhật hồ sơ.",
    required: "Vui lòng nhập đầy đủ địa chỉ thanh toán.",
  },
] as const;

describe("Profile billing address", () => {
  it.each(locales)("$locale reveals separate fields, keeps drafts across toggles and saves them", async (labels) => {
    vi.spyOn(profileService, "getCurrent").mockResolvedValue(profile);
    const updated = {
      ...profile,
      billingSameAsDelivery: false,
      billingAddress: { address: "2 Le Loi", postalCode: "700001", country: "VN" },
    };
    const update = vi.spyOn(profileService, "updateCurrent").mockResolvedValue(updated);
    const interaction = userEvent.setup();
    renderWithProviders(<ProfileScreen />, { locale: labels.locale });
    await interaction.click(await screen.findByRole("button", { name: labels.edit }));
    expect(screen.queryByRole("textbox", { name: labels.address })).not.toBeInTheDocument();

    const checkbox = screen.getByRole("checkbox", { name: labels.checkbox });
    checkbox.focus();
    await interaction.keyboard(" ");
    expect(checkbox).not.toBeChecked();
    const address = screen.getByRole("textbox", { name: labels.address });
    expect(address).toHaveValue(profile.billingAddress.address);
    fireEvent.change(address, { target: { value: updated.billingAddress.address } });
    fireEvent.change(screen.getByRole("textbox", { name: labels.postal }), { target: { value: "700001" } });
    await interaction.click(screen.getByRole("combobox", { name: labels.country }));
    await interaction.type(screen.getByRole("combobox", { name: labels.search }), "Vietnam");
    await interaction.click(screen.getByRole("option", { name: "Vietnam" }));
    await interaction.click(checkbox);
    expect(screen.queryByRole("textbox", { name: labels.address })).not.toBeInTheDocument();
    await interaction.click(checkbox);
    expect(screen.getByRole("textbox", { name: labels.address })).toHaveValue("2 Le Loi");
    await interaction.click(screen.getByRole("button", { name: labels.save }));

    await waitFor(() =>
      expect(update).toHaveBeenCalledWith(
        expect.objectContaining({
          billingSameAsDelivery: false,
          billingAddress: "2 Le Loi",
          billingPostalCode: "700001",
          billingCountry: "VN",
          deliveryAddress: profile.deliveryAddress,
        }),
        profile,
      ),
    );
    expect(await screen.findByRole("status")).toHaveTextContent(labels.success);
    expect(screen.getByRole("button", { name: labels.save })).toBeDisabled();
    await interaction.click(screen.getByRole("button", { name: labels.cancel }));
    expect(screen.getByText("2 Le Loi")).toBeVisible();
    await interaction.click(screen.getByRole("button", { name: labels.edit }));
    expect(screen.getByRole("checkbox", { name: labels.checkbox })).not.toBeChecked();
    expect(screen.getByRole("textbox", { name: labels.address })).toHaveValue("2 Le Loi");
  });

  it.each(locales)("$locale validates separate fields and allows saving when delivery is reused", async (labels) => {
    vi.spyOn(profileService, "getCurrent").mockResolvedValue(profile);
    const update = vi.spyOn(profileService, "updateCurrent").mockResolvedValue(profile);
    const interaction = userEvent.setup();
    renderWithProviders(<ProfileScreen />, { locale: labels.locale });
    await interaction.click(await screen.findByRole("button", { name: labels.edit }));
    const checkbox = screen.getByRole("checkbox", { name: labels.checkbox });
    await interaction.click(checkbox);
    const address = screen.getByRole("textbox", { name: labels.address });
    await interaction.clear(address);
    await interaction.click(screen.getByRole("button", { name: labels.save }));
    expect(await screen.findByText(labels.required)).toBeVisible();
    expect(address).toHaveAttribute("aria-invalid", "true");
    expect(update).not.toHaveBeenCalled();
    await interaction.click(checkbox);
    await interaction.click(screen.getByRole("button", { name: labels.save }));
    await waitFor(() => expect(update).toHaveBeenCalledOnce());
    expect(update.mock.calls[0]?.[0]).toMatchObject({ billingSameAsDelivery: true });
  });
});
