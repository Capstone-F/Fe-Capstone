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
    default: "GlowScan Admin",
    template: "%s | GlowScan Admin",
  },
  description:
    "Admin portal scaffold for GlowScan with Next.js 16, shadcn/ui, and BFF auth proxying to NestJS.",
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
    >
      <body className="bg-background text-foreground min-h-screen font-sans antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
