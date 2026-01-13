// src/app/layout.tsx
import type { Metadata } from "next";
import ClientAuthProvider from "@/context/ClientAuthProvider";
import Navbar from "@/components/Navbar"; // เราจะสร้าง Navbar ทีหลัง
import LayoutWrapper from "@/components/LayoutWrapper";

import { ThemeProvider } from "@/hooks/use-theme";
import "./globals.css"; // นี่คือไฟล์ App.css เดิมของเรา
import "./styles/TierListPage.css";
import "./styles/CharacterTooltip.css";


export const metadata: Metadata = {
  title: "DS Game Hub",
  description: "Your one-stop platform for the latest game character info, tier lists, and guides.",
  manifest: "/manifest.json",
  icons: {
    apple: "/default-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body>
        <ThemeProvider>
          <ClientAuthProvider>
            <LayoutWrapper>
              <Navbar />
              <main>{children}</main>
            </LayoutWrapper>
          </ClientAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}