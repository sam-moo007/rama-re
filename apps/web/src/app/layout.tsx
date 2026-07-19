import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";
import { Inter, Public_Sans } from "next/font/google";
import { cn } from "@/lib/utils";

const publicSansHeading = Public_Sans({subsets:['latin'],variable:'--font-heading'});

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: {
    default: "RAMA Real-Estate",
    template: "%s · RAMA Real-Estate",
  },
  description:
    "A trust-first Dubai real-estate platform with inspectable evidence, complete cost scenarios and accessible property tours.",
  openGraph: {
    type: "website",
    locale: "en_AE",
    url: "https://rama.ae",
    title: "RAMA Real-Estate",
    description: "A trust-first Dubai real-estate platform with inspectable evidence.",
    siteName: "RAMA Real-Estate",
  },
  twitter: {
    card: "summary_large_image",
    title: "RAMA Real-Estate",
    description: "A trust-first Dubai real-estate platform with inspectable evidence.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", inter.variable, publicSansHeading.variable)}>
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>{children}</body>
    </html>
  );
}
