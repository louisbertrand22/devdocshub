// app/layout.tsx
import type { Metadata } from "next";
import Providers from "./providers"; // ✅ bon import
import "@/styles/globals.css";
import dynamic from "next/dynamic";

// On charge le Shell côté client (useRouter/usePathname)
const AppShell = dynamic(() => import("@/components/layout/Shell"), {
  ssr: false,
});

export const metadata: Metadata = {
  title: "DevDocsHub",
  description: "Documentation & notes techniques centralisées",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Providers>
          <AppShell>{children as any}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
