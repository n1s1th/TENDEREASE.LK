"use client";

import { useEffect } from "react";
import RecommendationCard from "@/components/cao-dashboard/RecommendationCard";
import { useCAODashboardStore } from "@/store/cao-dashboard/cao-dashboard.store";
import EmptyState from "@/components/cao-dashboard/EmptyState";

export default function RejectedRecommendationsPage() {
  const recommendations = useCAODashboardStore((s) => s.recommendations);
  const loading = useCAODashboardStore((s) => s.recommendationsLoading);
  const fetchRecommendations = useCAODashboardStore((s) => s.fetchRecommendations);
  const department = useCAODashboardStore((s) => s.department);
  const searchQuery = useCAODashboardStore((s) => s.searchQuery);

  useEffect(() => {
    fetchRecommendations("REJECTED");
  }, [fetchRecommendations]);

  const filtered = recommendations.filter((rec) => {
    if (department) {
      const deptLower = department.toLowerCase().trim();
      const recDept = (rec.department || "").toLowerCase().trim();
      if (recDept !== deptLower) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      const bidder = (rec.bidderName || "").toLowerCase();
      const tenderId = (rec.tenderId || "").toLowerCase();
      if (!bidder.includes(q) && !tenderId.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="dash-kpi-row" style={{ gridTemplateColumns: "1fr", padding: "2rem 0" }}>
      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "var(--te-gray-4)" }}>Loading rejected recommendations...</div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No rejected recommendations" description="Rejected recommendations will appear here." />
      ) : (
        filtered.map((rec) => (
          <RecommendationCard
            key={rec.id}
            recommendation={rec}
          />
        ))
      )}
    </div>
  );
}
