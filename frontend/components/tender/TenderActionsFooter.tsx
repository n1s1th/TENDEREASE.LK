"use client";

import Link from "next/link";
import { useSavedTendersStore } from "@/store/saved-tenders.store";
import { Bookmark } from "lucide-react";

export default function TenderActionsFooter({ tender }: { tender: any }) {
  const { savedTenders, saveTender, removeTender, isSaved } = useSavedTendersStore();
  
  if (!tender?.id) return null;
  
  const saved = isSaved(tender.id);

  const toggleSave = () => {
    if (saved) {
      removeTender(tender.id);
    } else {
      saveTender({
        id: tender.id,
        tenderNumber: tender.tenderNumber,
        title: tender.title,
        departmentName: tender.departmentName,
        closingDate: tender.closingDate,
        status: tender.status,
        estimatedBudget: tender.estimatedBudget
      });
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 flex justify-between items-center shadow-sm">
      <button 
        onClick={toggleSave}
        className={`px-10 py-3 rounded-xl border flex items-center gap-2 font-bold text-sm transition-all ${
          saved 
            ? "border-primary bg-primary/10 text-primary hover:bg-primary/20" 
            : "border-gray-200 text-gray-900 hover:bg-gray-50"
        }`}
      >
        <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
        {saved ? "Saved" : "Save for Later"}
      </button>

      <Link href={`/tenders/${tender.id}/apply`}>
        <button className="px-12 py-3 rounded-xl bg-[#a03d11] text-white font-bold text-sm hover:bg-[#8a330e] transition-all hover:shadow-lg active:scale-95">
          APPLY NOW
        </button>
      </Link>
    </div>
  );
}

