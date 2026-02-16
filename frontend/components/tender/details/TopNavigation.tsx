"use client";

interface Props {
  menuItems?: string[];
}

export default function TopNavigation({
  menuItems = ["Menu", "Registration", "Twelve", "Thirteen"],
}: Props) {
  return (
    <div className="bg-white border-b">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center gap-6 text-sm">

        {/* Back to Search */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-black cursor-pointer"
        >
          ← Back to Search
        </button>

        {/* Divider */}
        <div className="h-5 w-px bg-gray-300"></div>

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
