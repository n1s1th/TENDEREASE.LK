"use client";

import { useEffect } from "react";
import RecommendationCard from "@/components/cao-dashboard/RecommendationCard";
import { useCAODashboardStore } from "@/store/cao-dashboard/cao-dashboard.store";
import EmptyState from "@/components/cao-dashboard/EmptyState";

export default function AcceptedRecommendationsPage() {
  const tenders = useCAODashboardStore((s) => s.tenders);
  const department = useCAODashboardStore((s) => s.department);
  const fetchTenders = useCAODashboardStore((s) => s.fetchTenders);

  useEffect(() => {
    fetchTenders();
  }, [fetchTenders, department]);

  // Using accepted status for mockup purposes
  const accepted = tenders.filter((t) => t.status === "approved");

  return (
    <div className="dash-kpi-row" style={{ gridTemplateColumns: "1fr", padding: "2rem 0" }}>
      {accepted.length === 0 ? (
        <EmptyState title="No accepted recommendations" description="Recommendations you accept will appear here." />
      ) : (
        accepted.map((tender) => (
          <RecommendationCard
            key={tender.id}
            tender={tender}
            status="accepted"
            timestamp={new Date().toLocaleDateString()}
          />
        ))
      )}
    </div>
  );
}
