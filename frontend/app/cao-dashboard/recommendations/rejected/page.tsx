"use client";

import { useEffect } from "react";
import RecommendationCard from "@/components/cao-dashboard/RecommendationCard";
import { useCAODashboardStore } from "@/store/cao-dashboard/cao-dashboard.store";
import EmptyState from "@/components/cao-dashboard/EmptyState";

export default function RejectedRecommendationsPage() {
  const tenders = useCAODashboardStore((s) => s.tenders);
  const department = useCAODashboardStore((s) => s.department);
  const fetchTenders = useCAODashboardStore((s) => s.fetchTenders);

  useEffect(() => {
    fetchTenders();
  }, [fetchTenders, department]);

  // Using rejected status for mockup purposes
  const rejected = tenders.filter((t) => t.status === "rejected");

  return (
    <div className="dash-kpi-row" style={{ gridTemplateColumns: "1fr", padding: "2rem 0" }}>
      {rejected.length === 0 ? (
        <EmptyState title="No rejected recommendations" description="Recommendations you reject will appear here." />
      ) : (
        rejected.map((tender) => (
          <RecommendationCard
            key={tender.id}
            tender={tender}
            status="rejected"
            timestamp={new Date().toLocaleDateString()}
            reason={tender.rejectionReason || "Does not meet the financial thresholds required for this procurement block."}
          />
        ))
      )}
    </div>
  );
}
