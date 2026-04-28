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
    <div className="dash-tabbar" id="recommendation-tabs">
      {tabs.map((tab) => {
        const isActive = getActive(tab.href);
        return (
          <Link
            key={tab.key}
            href={tab.href}
            className={`dash-tab ${isActive ? "dash-tab--active" : ""}`}
          >
            {tab.label}
          </Link>
        );
      })}

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
              placeholder="Search recommendations..."
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
            aria-label="Search recommendations"
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
