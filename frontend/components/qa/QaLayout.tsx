"use client";

import Link from "next/link";
import { HelpCircle, Search, User } from "lucide-react";
import type { ReactNode } from "react";

export default function QaLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-[#fafafa] min-h-screen text-black-2 font-inter selection:bg-secondary/20 selection:text-primary">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 sm:px-10 py-4 flex justify-between items-center transition-all duration-300">
        <Link href="/" className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
            <div className="w-5 h-5 border-2 border-white/90 rotate-45 rounded-sm" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-black-1 tracking-tight leading-none mb-0.5">TenderEase</span>
            <span className="text-[10px] text-primary font-bold uppercase tracking-[0.2em]">Bid Platform</span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <button className="hidden md:flex items-center gap-2 text-gray-3 font-semibold hover:text-black-1 px-4 py-2 rounded-xl transition-all">
            <Search size={20} />
            <span className="text-sm">Quick Search</span>
          </button>

          <button className="flex items-center gap-3 bg-white border border-gray-100 text-black-2 font-bold hover:bg-gray-50 px-5 py-2.5 rounded-2xl transition-all shadow-sm active:scale-[0.98]">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/10">
              <User size={18} fill="currentColor" className="opacity-80" />
            </div>
            <span className="text-sm">My Account</span>
          </button>
        </div>
      </header>

      <nav className="bg-white px-6 sm:px-10 py-4 flex items-center justify-between border-b border-gray-100 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-6 text-sm font-bold text-gray-3 whitespace-nowrap">
          <span className="flex items-center gap-2 text-primary">
            <HelpCircle size={18} />
            Q&A
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-[11px] font-black text-gray-3 uppercase tracking-widest">Active Session</span>
        </div>
      </nav>

      <main className="max-w-[1440px] mx-auto px-6 sm:px-10 py-10">
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700 ease-out fill-mode-both">
          {children}
        </div>
      </main>
    </div>
  );
}
