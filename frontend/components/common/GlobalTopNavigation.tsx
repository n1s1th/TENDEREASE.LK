"use client";

interface Props {
  menuItems?: string[];
}

export default function GlobalTopNavigation({
  menuItems = ["Registration", "Twelve", "Thirteen"],
}: Props) {
  return (
    <div className="bg-white border-b">
      <div className="w-full px-4 py-3 flex items-center gap-6 text-sm">
        {menuItems.map((item, index) => (
          <button
            key={index}
            className="text-gray-600 hover:text-black cursor-pointer"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
