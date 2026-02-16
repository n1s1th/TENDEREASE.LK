"use client";

interface Props {
  active: string;
  setActive: (value: string) => void;
}

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "requirements", label: "Requirements" },
  { id: "documents", label: "Documents" },
  { id: "addenda", label: "Addenda" },
  { id: "clarifications", label: "Clarifications" },
  { id: "timeline", label: "Timeline" },
  { id: "contact", label: "Contact" },
];

export default function TenderTabs({ active, setActive }: Props) {
  return (
    <div className="bg-white rounded-xl shadow">
      {/* Scroll container for small screens */}
      <div className="overflow-x-auto">
        <div className="flex min-w-max border-b px-6 gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`
                py-4 text-sm font-medium whitespace-nowrap
                transition-colors duration-200
                cursor-pointer
                ${
                  active === tab.id
                    ? "border-b-2 border-orange-600 text-orange-600"
                    : "text-gray-600 hover:text-black"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
