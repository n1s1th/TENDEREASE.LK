"use client";

import Link from "next/link";
import { ArrowLeft, HelpCircle } from "lucide-react";
import type { ReactNode } from "react";
import Footer from "@/components/home/Footer";

export default function QaLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-[#fafafa] min-h-screen text-black-2 font-inter selection:bg-secondary/20 selection:text-primary flex flex-col">
      {/* Breadcrumb / Back navigation */}
      <nav className="bg-white px-6 sm:px-10 py-3 flex items-center border-b border-gray-100 overflow-x-auto no-scrollbar">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm font-bold text-gray-3 hover:text-primary transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>
      </nav>

      <main className="max-w-[1440px] mx-auto px-6 sm:px-10 py-10 flex-1 w-full">
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700 ease-out fill-mode-both">
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
}

