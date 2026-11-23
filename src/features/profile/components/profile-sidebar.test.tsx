import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithProviders } from "@/test/render-with-providers";

import { profileFixture } from "../test/profile-fixture";
import { ProfileSidebar } from "./profile-sidebar";

it("translates profile membership, avatar text, and the picture dialog in Vietnamese", async () => {
  renderWithProviders(<ProfileSidebar user={profileFixture} />, { locale: "vi" });

  const date = new Intl.DateTimeFormat("vi", { month: "short", year: "numeric", timeZone: "UTC" }).format(
    new Date(profileFixture.joinedAt),
  );
  expect(screen.getByText(`Thành viên từ ${date}`)).toBeInTheDocument();
  expect(screen.getByRole("img", { name: `Ảnh hồ sơ của ${profileFixture.fullName}` })).toBeInTheDocument();
  await userEvent.setup().click(screen.getByRole("button", { name: "Đổi ảnh hồ sơ" }));
  expect(screen.getByRole("dialog", { name: "Đổi ảnh hồ sơ" })).toBeInTheDocument();
  expect(screen.queryByText(/Member since/)).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Change profile picture" })).not.toBeInTheDocument();
});
