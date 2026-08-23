"use client";

import { useEffect, useState } from "react";
import AwardProcessingList from "@/components/officer-dashboard/awards/AwardProcessingList";
import AwardProcessingDetail from "@/components/officer-dashboard/awards/AwardProcessingDetail";
import AwardedTendersTable from "@/components/officer-dashboard/awards/AwardedTendersTable";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AwardsProcessingPage() {
  const [selectedTenderId, setSelectedTenderId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div style={{ padding: "2.25rem 0 1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem" }} className="w-full flex-col sm:flex-row sm:items-center">
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
            <div style={{ width: 4, height: 60, background: "#953002", borderRadius: 4, marginTop: "0.2rem" }} className="shrink-0"></div>
            <div>
              <h1 style={{
                fontSize: "1.85rem",
                fontWeight: 800,
                color: "#1e293b",
                letterSpacing: "0.01em",
                margin: 0,
                lineHeight: 1.2
              }}>
                Awards Processing
              </h1>
              <p style={{ fontSize: "0.9rem", color: "#94a3b8", fontWeight: 500, margin: "0.6rem 0 0" }}>
                Finalize awarded tenders, view CAO approval status, and manage notifications to bidders.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="pb-2">
        <Link href="/officer-dashboard" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-[#953002] transition-colors bg-white hover:bg-[#FDF7F4] px-3 py-1.5 rounded-lg border border-gray-200 hover:border-[#953002]/30 shadow-sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Officer Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-8">
        <div className="lg:col-span-4">
          <AwardProcessingList 
            selectedTenderId={selectedTenderId} 
            onSelect={setSelectedTenderId} 
          />
        </div>
        <div className="lg:col-span-8">
          <AwardProcessingDetail tenderId={selectedTenderId} />
        </div>
      </div>

      {/* Awarded Tenders Section */}
      <AwardedTendersTable />
    </div>
  );
}
