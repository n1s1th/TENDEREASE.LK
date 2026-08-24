"use client";

import Link from "next/link";
import { useState } from "react";
import { Bookmark, Check } from "lucide-react";
import { useSavedTendersStore } from "@/store";

export default function TenderActionsFooter({ tenderId }: { tenderId: string }) {
  const isSaved = useSavedTendersStore((s) =>
    tenderId ? s.savedIds.includes(String(tenderId)) : false
  );
  const toggleTender = useSavedTendersStore((s) => s.toggleTender);
  const [toggling, setToggling] = useState(false);

  const handleToggleSave = async () => {
    if (!tenderId || toggling) return;
    setToggling(true);
    try {
      await toggleTender(String(tenderId));
    } catch (error) {
      console.error("Could not update saved tender:", error);
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 flex justify-between items-center shadow-sm">
      <button
        onClick={handleToggleSave}
        disabled={!tenderId || toggling}
        aria-pressed={isSaved}
        className={`px-10 py-3 rounded-xl border font-bold text-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
          isSaved
            ? "border-primary/20 bg-primary/5 text-primary"
            : "border-gray-200 text-gray-900 hover:bg-gray-50"
        }`}
      >
        {isSaved ? <Check size={16} /> : <Bookmark size={16} />}
        {isSaved ? "Saved" : "Save for Later"}
      </button>

      {isSaved && (
        <Link
          href="/tenders?tab=saved"
          className="text-sm font-bold text-primary hover:underline"
        >
          View saved tenders
        </Link>
      )}

      <Link href={`/tenders/${tenderId}/apply`}>
        <button className="px-12 py-3 rounded-xl bg-[#a03d11] text-white font-bold text-sm hover:bg-[#8a330e] transition-all hover:shadow-lg active:scale-95">
          APPLY NOW
        </button>
      </Link>
    </div>
  );
}
