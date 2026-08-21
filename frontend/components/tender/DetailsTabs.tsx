"use client";

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
    <div className="flex gap-2 sm:gap-4 p-1 bg-gray-5/50 rounded-2xl border border-gray-100 overflow-x-auto no-scrollbar">
      {TABS.map((tab) => {
        const isActive = activeTab.toLowerCase() === tab.toLowerCase();
        return (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              px-6 py-3 text-xs sm:text-sm font-black whitespace-nowrap transition-all duration-300 rounded-xl relative
              ${isActive 
                ? "bg-white text-primary shadow-premium border border-gray-100 translate-y-[-1px]" 
                : "text-gray-3 hover:text-black-2 hover:bg-white/50"
              }
            `}
          >
            {tab}
            {isActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full"></span>
            )}
          </button>
        );
      })}
    </div>
  );
}