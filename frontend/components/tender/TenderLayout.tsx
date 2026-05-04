"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TenderLayout({ children }: any) {
  return (
    <div className="bg-[#fafafa] min-h-screen text-black-2 font-inter selection:bg-secondary/20 selection:text-primary">
      {/* --- Breadcrumbs / Sub-Navigation --- */}
      <nav className="bg-white px-6 sm:px-10 py-4 flex items-center justify-between border-b border-gray-100 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-6 text-sm font-bold text-gray-3 whitespace-nowrap">
          <Link href="/tenders" className="flex items-center gap-2 hover:text-primary transition-colors group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to Tenders
          </Link>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
          <span className="text-[11px] font-black text-gray-3 uppercase tracking-widest">Active Session</span>
        </div>
      </nav>

      {/* --- Main Content Section --- */}
      <main className="max-w-[1440px] mx-auto px-6 sm:px-10 py-10">
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700 ease-out fill-mode-both">
          {children}
        </div>
      </main>
    </div>
  );
}