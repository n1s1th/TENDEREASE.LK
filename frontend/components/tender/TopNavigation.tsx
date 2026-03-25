"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function TenderTopNavigation() {
  const router = useRouter();

  return (
    <div className="bg-gray-50 border-b">
      <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center">

        <button
          onClick={() => router.push("/tenders")}
          className="
            flex items-center gap-2
            text-sm font-medium
            text-gray-600
            hover:text-orange-600
            transition-colors
            cursor-pointer
          "
        >
          <ArrowLeft size={16} />
          All Tenders
        </button>

      </div>
    </div>
  );
}
