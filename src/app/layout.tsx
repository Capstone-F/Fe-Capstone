import type { Metadata } from "next";
import {
  JetBrains_Mono,
  Manrope,
  Playfair_Display,
  Space_Grotesk,
} from "next/font/google";

import { AppProviders } from "@/shared/components/providers/app-providers";
import { appConfig } from "@/lib/env";

import "./globals.css";

const fontSans = Manrope({
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
});

const fontSerif = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  variable: "--font-serif",
});

const fontHeading = Space_Grotesk({
  subsets: ["latin", "vietnamese"],
  variable: "--font-heading",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin", "vietnamese"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(appConfig.appUrl),
  title: {
    default: "GlowScan",
    template: "%s | GlowScan",
  },
  description:
    "GlowScan kết hợp phân tích da AI, routine cá nhân hóa, cửa hàng skincare và mạng lưới chuyên gia da liễu.",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      data-scroll-behavior="smooth"
      className={`${fontSans.variable} ${fontSerif.variable} ${fontHeading.variable} ${fontMono.variable}`}
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
