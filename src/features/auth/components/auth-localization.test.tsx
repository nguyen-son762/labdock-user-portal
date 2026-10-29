import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NextIntlClientProvider } from "next-intl";

import messages from "../../../../messages/vi.json";
import { ForgotPasswordForm } from "./forgot-password-form";
import { SignupForm } from "./signup-form";

function renderVietnamese(ui: React.ReactNode) {
  return render(
    <NextIntlClientProvider locale="vi" messages={messages}>
      <QueryClientProvider client={new QueryClient()}>{ui}</QueryClientProvider>
    </NextIntlClientProvider>,
  );
}

describe("Vietnamese account forms", () => {
  it("BP-TK-01-06 translates the visible phone label", () => {
    renderVietnamese(<SignupForm />);
    expect(screen.queryByText("Phone no.")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Số điện thoại")).toBeInTheDocument();
  });

  it("BP-TK-03-01 translates the email label", () => {
    renderVietnamese(<ForgotPasswordForm />);
    expect(screen.getByRole("textbox", { name: "Địa chỉ email *" })).toBeInTheDocument();
  });
});
