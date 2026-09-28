// app/layout.tsx
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import Providers from "./providers";
import { themeInitScript } from "@/lib/theme";
import "@/styles/globals.css";

// Remplacé par SiteChrome (rendu serveur) en Task 6
const AppShell = dynamic(() => import("@/components/layout/Shell"), {
  ssr: false,
});

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
      </head>
      <body>
        <Providers>
          <AppShell>{children as any}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
