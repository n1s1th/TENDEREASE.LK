"use client";

import { useRouter } from "next/navigation";

interface Props {
  menuItems?: string[];
}

export default function TenderTopNavigation({
  menuItems = ["Home", "Departments", "How it Works", "Help/FAQ"],
}: Props) {
  const router = useRouter();

  return (
    <div className="bg-white border-b">
      <div className="w-full px-4 py-3 flex items-center gap-6 text-sm">
        
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-black cursor-pointer"
        >
          ← Back to Search
        </button>

        <div className="h-4 w-px bg-gray-300"></div>

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
