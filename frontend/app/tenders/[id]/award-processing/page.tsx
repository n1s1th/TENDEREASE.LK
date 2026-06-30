"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Footer from "@/components/home/Footer";

export default function AwardProcessingPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  return (
    <div className="bg-[#fcfbfc]/90 min-h-screen text-gray-900 font-inter flex flex-col">
      {/* Navigation Header */}
      <nav className="bg-white px-6 sm:px-10 py-4 flex items-center justify-between border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-6 text-sm font-bold text-gray-500">
          <Link href="/officer-dashboard" className="flex items-center gap-2 hover:text-[#953002] transition-colors group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse"></span>
          <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Awards Panel</span>
        </div>
      </nav>

      {/* Main Panel Content */}
      <main className="flex-grow w-full max-w-[800px] mx-auto px-6 py-20">
      </main>

      <div>
        <Footer />
      </div>
    </div>
  );
}
