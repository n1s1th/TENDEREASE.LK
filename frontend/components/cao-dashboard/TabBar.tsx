"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import type { TenderTab } from "@/lib/types/cao-dashboard.types";
import { useCAODashboardStore } from "@/store/cao-dashboard/cao-dashboard.store";

interface TabDef {
  key: TenderTab;
  label: string;
  href: string;
  badge?: number;
}

const tabs: TabDef[] = [
  { key: "pending", label: "Pending", href: "/cao-dashboard/tenders/pending" },
  { key: "approved", label: "Approved", href: "/cao-dashboard/tenders/approved" },
  { key: "rejected", label: "Rejected", href: "/cao-dashboard/tenders/rejected" },
  { key: "recent-awards", label: "Recent Awards", href: "/cao-dashboard/tenders/recent-awards" },
];

interface TabBarProps {
  badgeCounts?: Partial<Record<TenderTab, number>>;
}

export default function TabBar({ badgeCounts }: TabBarProps) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const searchQuery = useCAODashboardStore((s) => s.searchQuery);
  const setSearchQuery = useCAODashboardStore((s) => s.setSearchQuery);

  const getActive = (href: string) => pathname === href;

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchOpen]);

  // Close search and clear query on Escape
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 mb-8 w-full" id="tender-tabs">
      <div className="flex items-center gap-2 flex-wrap flex-grow">
        {tabs.map((tab) => {
          const isActive = getActive(tab.href);
          const count = badgeCounts?.[tab.key];

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
                {count != null && count > 0 && (
                  <span className={`px-1.5 py-0.5 text-2xs font-bold rounded-full leading-none ${isActive ? "bg-white text-[#953002]" : "bg-red-500 text-white"
                    }`}>
                    {count > 99 ? "99+" : count}
                  </span>
                )}
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
          placeholder="Search tenders by  reference no, title, or type…"
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
