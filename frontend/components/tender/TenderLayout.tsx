"use client";

import Footer from "@/components/home/Footer";

export default function TenderLayout({ children }: any) {
  return (
    <div className="bg-[#fafafa] min-h-screen text-black-2 font-sans selection:bg-secondary/20 selection:text-primary">


      {/* --- Main Content Section --- */}
      <main className="max-w-[1440px] mx-auto px-6 sm:px-10 py-10">
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700 ease-out fill-mode-both">
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
}