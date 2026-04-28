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
  { key: "audit-logs", label: "Audit Logs", href: "/cao-dashboard/tenders/audit-logs" },
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
    <div className="dash-tabbar" id="tender-tabs">
      {tabs.map((tab) => {
        const isActive = getActive(tab.href);
        const count = badgeCounts?.[tab.key];

        return (
          <Link
            key={tab.key}
            href={tab.href}
            className={`dash-tab ${isActive ? "dash-tab--active" : ""}`}
          >
            {tab.label}
            {count != null && count > 0 && (
              <span className="dash-tab-badge">{count > 99 ? "99+" : count}</span>
            )}
          </Link>
        );
      })}

      {/* Search toggle + expandable input */}
      <div className="dash-tab-search-wrapper">
        {searchOpen ? (
          <div className="dash-tab-search-expanded">
            <Search size={15} style={{ color: "var(--te-gray-4)", flexShrink: 0 }} />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search tenders…"
              className="dash-tab-search-input"
            />
            <button
              className="dash-tab-search-close"
              aria-label="Close search"
              onClick={() => {
                setSearchOpen(false);
                setSearchQuery("");
              }}
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            className="dash-tab-search"
            aria-label="Search tenders"
            onClick={() => setSearchOpen(true)}
          >
            <Search size={16} />
            Search
          </button>
        )}
      </div>
    </div>
  );
}
