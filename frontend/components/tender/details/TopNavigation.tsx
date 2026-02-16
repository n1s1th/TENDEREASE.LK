"use client";

interface Props {
  menuItems?: string[];
}

export default function TopNavigation({
  menuItems = ["Menu", "Registration", "Twelve", "Thirteen"],
}: Props) {
  return (
    <div className="bg-white border-b">

      {/* IMPORTANT: px-3 to match page content */}
      <div className="w-full px-3 py-2 flex items-center gap-6 text-sm">

        {/* Back to Search */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-black cursor-pointer"
        >
          ← Back to Search
        </button>

        {/* Divider */}
        <div className="h-4 w-px bg-gray-300"></div>

        {/* Dynamic Menu */}
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
