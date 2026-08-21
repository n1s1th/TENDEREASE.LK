"use client";

import { cn } from "@/lib/utils";

const TABS = [
  "Overview",
  "Requirements",
  "Documents",
  "Addenda",
  "Clarifications",
  "Timeline",
  "Contact",
];

export default function DetailsTabs({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) {
  return (
    <div className="border-b border-border">
      <div className="flex gap-6 overflow-x-auto no-scrollbar">
        {TABS.map((tab) => {
          const isActive = activeTab.toLowerCase() === tab.toLowerCase();
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "py-3 text-sm font-semibold whitespace-nowrap transition-all duration-200 border-b-2 relative",
                isActive 
                  ? "border-primary text-primary" 
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              {tab}
            </button>
          );
        })}
      </div>
    </div>
  );
}