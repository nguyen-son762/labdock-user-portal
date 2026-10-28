import { render, screen } from "@testing-library/react";
import axios from "axios";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";

import en from "../../../../messages/en.json";
import viMessages from "../../../../messages/vi.json";

import { AccountErrorState } from "./account-error-state";

describe("AccountErrorState", () => {
  it("updates the displayed API error when the locale changes", () => {
    const error = new axios.AxiosError("Forbidden", "ERR_BAD_REQUEST", undefined, undefined, {
      data: {},
      status: 403,
      statusText: "Forbidden",
      headers: {},
      config: { headers: new axios.AxiosHeaders() },
    });
    const onRetry = vi.fn();
    const { rerender } = render(
      <NextIntlClientProvider locale="en" messages={en}>
        <AccountErrorState error={error} onRetry={onRetry} />
      </NextIntlClientProvider>,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(en.ApiErrors.forbidden);

    rerender(
      <NextIntlClientProvider locale="vi" messages={viMessages}>
        <AccountErrorState error={error} onRetry={onRetry} />
      </NextIntlClientProvider>,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(viMessages.ApiErrors.forbidden);
  });
});
