"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Bookmark } from "lucide-react";

import TenderLayout from "@/components/tender/TenderLayout";
import TenderTable from "@/components/tender/TenderTable";
import RequireAuth from "@/components/auth/RequireAuth";
import { useSavedTendersStore } from "@/store";

function SavedTendersList() {
  const savedTenders = useSavedTendersStore((s) => s.savedTenders);
  const loading = useSavedTendersStore((s) => s.loading);
  const fetchTenders = useSavedTendersStore((s) => s.fetchTenders);

  // Always re-read from the backend on mount so the list reflects bookmarks
  // made on another device or in another tab.
  useEffect(() => {
    fetchTenders();
  }, [fetchTenders]);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-10 py-10 space-y-12">
      {/* Header */}
      <div className="relative">
        <div className="absolute -left-4 top-0 w-1 h-12 bg-primary rounded-full"></div>
        <div className="space-y-2 pl-6">
          <h1 className="text-4xl font-extrabold text-black-1 tracking-tight">Saved Tenders</h1>
          <p className="text-gray-2 font-normal">
            Tenders you have bookmarked for <strong className="text-black-2 font-semibold">later review</strong>.
          </p>
        </div>
      </div>

      <div className="space-y-8 animate-in fade-in duration-700">
        <div className="flex justify-between items-end px-2">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-black-1 uppercase tracking-tight">Your Bookmarks</h2>
            <div className="h-1 w-12 bg-secondary rounded-full"></div>
          </div>
          <span className="text-xs font-semibold text-gray-3 uppercase tracking-widest">
            {loading ? (
              "Synchronizing..."
            ) : (
              <>
                <strong className="text-black-1 font-bold text-sm normal-case tracking-normal">
                  {savedTenders.length}
                </strong>{" "}
                Saved
              </>
            )}
          </span>
        </div>

        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center space-y-4 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="text-sm font-semibold text-gray-3 uppercase tracking-[0.2em] animate-pulse">
              Loading Saved Tenders
            </p>
          </div>
        ) : savedTenders.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-5 bg-white rounded-[2rem] border border-gray-100 shadow-sm text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-gray-5 flex items-center justify-center text-gray-3 border border-gray-100">
              <Bookmark size={28} />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-black-1">No saved tenders yet</h3>
              <p className="text-sm text-gray-2 font-medium max-w-md">
                Open a tender and use the bookmark button to keep it here for quick access.
              </p>
            </div>
            <Link href="/tenders">
              <button className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:shadow-primary shadow-sm active:scale-[0.98]">
                Browse Tenders
              </button>
            </Link>
          </div>
        ) : (
          <TenderTable data={savedTenders} />
        )}
      </div>
    </div>
  );
}

export default function SavedTendersPage() {
  return (
    <TenderLayout>
      <RequireAuth message="Log in or register to view the tenders you have saved.">
        <SavedTendersList />
      </RequireAuth>
    </TenderLayout>
  );
}
