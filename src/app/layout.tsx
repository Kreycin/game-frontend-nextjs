// src/app/layout.tsx
import type { Metadata } from "next";
import ClientAuthProvider from "@/context/ClientAuthProvider";
import Navbar from "@/components/Navbar"; // เราจะสร้าง Navbar ทีหลัง
import "./globals.css"; // นี่คือไฟล์ App.css เดิมของเรา
import "./styles/TierListPage.css";
import "./styles/CharacterTooltip.css";
import "./styles/NotificationSettings.css";

export const metadata: Metadata = {
  title: "New Character Leaked",
  description: "Your one-stop platform for the latest game character info, tier lists, and guides.",
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
          <Navbar />
          <main>{children}</main>
        </ClientAuthProvider>
      </body>
    </html>
  );
}