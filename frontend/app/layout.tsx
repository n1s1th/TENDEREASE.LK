import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppHeader from "@/components/common/AppHeader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TenderEase.lk",
  description: "Sri Lanka Government Tendering & Bidding Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100 min-h-screen`}
      >
        {/* Global Header (Visible on Entire App) */}
        <AppHeader />

        {/* Main Content Area */}
        <main className="w-full min-h-[calc(100vh-80px)]">
          {children}
        </main>
      </body>
    </html>
  );
}
