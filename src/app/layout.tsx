import type { ReactNode } from "react";
import { Geist } from "next/font/google";
import { getLocale } from "next-intl/server";

import "./globals.css";

const geist = Geist({
  subsets: ["latin", "latin-ext"],
});

export const metadata = {
  icons: {
    icon: [
      { url: "/favicon_io/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon_io/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon_io/favicon.ico", type: "image/x-icon" },
    ],
    apple: "/favicon_io/apple-touch-icon.png",
  },
  manifest: "/favicon_io/site.webmanifest",
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default async function RootLayout({ children }: RootLayoutProps) {
  const locale = await getLocale();
  return (
    <html lang={locale} data-scroll-behavior="smooth">
      <body className={`${geist.className} min-h-dvh`}>{children}</body>
    </html>
  );
}
