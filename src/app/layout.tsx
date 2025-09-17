// src/app/layout.tsx
import type { Metadata } from "next";
import ClientAuthProvider from "@/context/ClientAuthProvider";
import Navbar from "@/components/Navbar"; // เราจะสร้าง Navbar ทีหลัง
import LayoutWrapper from "@/components/LayoutWrapper";
import NotificationButtonWrapper from "@/components/NotificationButtonWrapper";
import "./globals.css"; // นี่คือไฟล์ App.css เดิมของเรา
import "./styles/TierListPage.css";
import "./styles/CharacterTooltip.css";
import "./styles/NotificationSettings.css";

export const metadata: Metadata = {
  title: "DS Game Hub",
  description: "Your one-stop platform for the latest game character info, tier lists, and guides.",
    manifest: "/manifest.json", 
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ClientAuthProvider>
          <NotificationButtonWrapper> {/* <-- 2. นำมาหุ้มตรงนี้ */}
            <LayoutWrapper>
              <Navbar />
              <main>{children}</main>
            </LayoutWrapper>
          </NotificationButtonWrapper> {/* <-- 3. ปิด Tag */}
        </ClientAuthProvider>
      </body>
    </html>
  );
}