// app/layout.tsx
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import Providers from "./providers";
import { SiteChrome } from "@/components/layout/site-chrome";
import { themeInitScript } from "@/lib/theme";
import { landingInitScript } from "@/lib/landing";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "DevDocsHub",
  description: "Documentation & notes techniques centralisées",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      className={`dark ${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script dangerouslySetInnerHTML={{ __html: landingInitScript }} />
      </head>
      <body>
        <Providers>
          <SiteChrome year={new Date().getFullYear()}>{children}</SiteChrome>
        </Providers>
      </body>
    </html>
  );
}
