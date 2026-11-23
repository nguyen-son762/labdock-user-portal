import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions, type RenderResult } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactElement, ReactNode } from "react";

import type { AppLocale } from "@/i18n/routing";

import messages from "../../messages/en.json";
import vietnameseMessages from "../../messages/vi.json";

function TestProviders({ children, locale = "en" }: { children: ReactNode; locale?: AppLocale }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <NextIntlClientProvider locale={locale} messages={locale === "vi" ? vietnameseMessages : messages} timeZone="UTC">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </NextIntlClientProvider>
  );
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper"> & { locale?: AppLocale },
): RenderResult {
  const { locale, ...renderOptions } = options ?? {};
  return render(ui, {
    wrapper: ({ children }) => <TestProviders locale={locale}>{children}</TestProviders>,
    ...renderOptions,
  });
}
