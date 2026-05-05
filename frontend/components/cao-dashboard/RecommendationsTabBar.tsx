"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import { useCAODashboardStore } from "@/store/cao-dashboard/cao-dashboard.store";

type RecTab = "all" | "pending" | "accepted" | "rejected";

interface TabDef {
  key: RecTab;
  label: string;
  href: string;
  badge?: number;
}

const tabs: TabDef[] = [
  { key: "all", label: "All", href: "/cao-dashboard/recommendations/all" },
  { key: "pending", label: "Pending", href: "/cao-dashboard/recommendations/pending" },
  { key: "accepted", label: "Accepted", href: "/cao-dashboard/recommendations/accepted" },
  { key: "rejected", label: "Rejected", href: "/cao-dashboard/recommendations/rejected" },
];

export default function RecommendationsTabBar() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const searchQuery = useCAODashboardStore((s) => s.searchQuery);
  const setSearchQuery = useCAODashboardStore((s) => s.setSearchQuery);

  const getActive = (href: string) => pathname === href;

  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 mb-8 w-full font-sans" id="recommendation-tabs">
      <div className="flex items-center gap-2 flex-wrap flex-grow">
        {tabs.map((tab) => {
          const isActive = getActive(tab.href);

          return (
            <Link
              key={tab.key}
              href={tab.href}
              className={`px-4 py-2 text-sm font-bold rounded-xl border transition-all duration-200 ${isActive
                ? "bg-[#953002] text-white border-[#953002] shadow-md"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300 shadow-sm"
                }`}
            >
              <span className="relative flex items-center gap-2">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Open, spacious search bar */}
      <div className="flex items-center gap-3 bg-white border border-slate-200/80 px-4 py-2.5 rounded-xl flex-grow max-w-lg shadow-sm focus-within:ring-2 focus-within:ring-[#953002]/20 transition-all duration-200">
        <Search size={18} className="text-slate-400 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search recommendations by bidder name or ID..."
          className="bg-transparent border-none outline-none text-sm text-slate-800 placeholder-slate-400 w-full"
        />
        {searchQuery && (
          <button
            className="text-slate-400 hover:text-slate-600"
            onClick={() => setSearchQuery("")}
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
