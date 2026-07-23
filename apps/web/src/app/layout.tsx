import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";
import { Inter, Playfair_Display } from "next/font/google";
import { cn } from "@/lib/utils";

const playfairHeading = Playfair_Display({subsets:['latin'],variable:'--font-heading'});

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
    <html lang="en" suppressHydrationWarning className={cn("font-sans", inter.variable, playfairHeading.variable)}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
