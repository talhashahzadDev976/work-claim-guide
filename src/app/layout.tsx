import type { Metadata, Viewport } from "next";
import { Public_Sans, Source_Serif_4 } from "next/font/google";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { allPlaces } from "@/lib/places/server";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME}: free workers' comp and injury claim calculators`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Free, state-specific calculators for workers' comp and injury claims. See every step and the official source. No sign-up.",
};

export const viewport: Viewport = {
  themeColor: "#0f5257",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-US" data-scroll-behavior="smooth" className={`${publicSans.variable} ${sourceSerif.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only z-50 rounded-md bg-surface px-4 py-2 font-semibold focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
        >
          Skip to content
        </a>
        <SiteHeader places={allPlaces()} />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
