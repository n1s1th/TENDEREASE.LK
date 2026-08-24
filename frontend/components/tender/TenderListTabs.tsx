"use client";

import { Bookmark } from "lucide-react";

export type TenderListTab = "open" | "closed" | "saved";

interface TabDef {
  key: TenderListTab;
  label: string;
  icon?: React.ReactNode;
}

interface Props {
  activeTab: TenderListTab;
  onTabChange: (tab: TenderListTab) => void;
  /** Saved tenders are per-user, so the tab only appears once signed in. */
  showSaved?: boolean;
  counts?: Partial<Record<TenderListTab, number>>;
}

export default function TenderListTabs({ activeTab, onTabChange, showSaved, counts }: Props) {
  const tabs: TabDef[] = [
    { key: "open", label: "Open Tenders" },
    { key: "closed", label: "Closed Tenders" },
    ...(showSaved
      ? [{ key: "saved" as const, label: "Saved Tenders", icon: <Bookmark size={15} /> }]
      : []),
  ];

  return (
    <div className="dash-tabbar" id="tender-list-tabs">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const count = counts?.[tab.key];

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            aria-current={isActive ? "page" : undefined}
            className={`dash-tab ${isActive ? "dash-tab--active" : ""}`}
          >
            {tab.icon}
            {tab.label}
            {count != null && count > 0 && (
              <span className="dash-tab-badge">{count > 99 ? "99+" : count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
