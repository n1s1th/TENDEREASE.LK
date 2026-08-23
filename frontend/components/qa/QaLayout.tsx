"use client";

import type { ReactNode } from "react";
import BackLink from "@/components/ui/back-link";
import Footer from "@/components/home/Footer";

export default function QaLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-[#fafafa] min-h-screen text-gray-900 font-inter selection:bg-secondary/20 selection:text-primary flex flex-col">
      <main className="max-w-[1440px] mx-auto px-6 sm:px-10 py-10 flex-1 w-full">
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700 ease-out fill-mode-both">
          <BackLink href="/" label="Back to Home" />
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
}

