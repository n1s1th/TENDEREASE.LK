interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const tabs = ["All", "Open", "Upcoming", "Closed"];

export default function TenderTabs({ activeTab, setActiveTab }: Props) {
  return (
    <div className="flex gap-3 border-b pb-3">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition
            ${
              activeTab === tab
                ? "bg-orange-500 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
