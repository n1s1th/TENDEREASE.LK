"use client";

interface Props {
  active: string;
  setActive: (tab: string) => void;
}

const tabs = [
  { key: "overview", label: "Overview" },
  { key: "requirements", label: "Requirements" },
  { key: "documents", label: "Documents" },
  { key: "addenda", label: "Addenda" },
  { key: "clarifications", label: "Clarifications" },
  { key: "timeline", label: "Timeline" },
  { key: "contact", label: "Contact" },
];

export default function DetailsTabs({ active, setActive }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm px-6 py-5">

      <div className="flex flex-wrap gap-8 border-b pb-4">

        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`text-sm font-medium cursor-pointer pb-2 transition ${
              active === tab.key
                ? "text-orange-700 border-b-2 border-orange-700"
                : "text-gray-600 hover:text-orange-700"
            }`}
          >
            {tab.label}
          </button>
        ))}

      </div>

    </div>
  );
}
