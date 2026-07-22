import type { Metadata } from "next";
import { JetBrains_Mono, Manrope, Space_Grotesk } from "next/font/google";

import { AppProviders } from "@/shared/components/providers/app-providers";
import { appConfig } from "@/lib/env";

import "./globals.css";

const fontSans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontHeading = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(appConfig.appUrl),
  title: {
    default: "GlowScan",
    template: "%s | GlowScan",
  },
  description:
    "GlowScan ket hop phan tich da AI, routine ca nhan hoa, cua hang skincare va mang luoi chuyen gia da lieu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${fontHeading.variable} ${fontMono.variable}`}
      suppressHydrationWarning
    >
      <body
        className="bg-background text-foreground min-h-screen font-sans antialiased"
        suppressHydrationWarning
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
