"use client";

import { useEffect } from "react";
import RecommendationCard from "@/components/cao-dashboard/RecommendationCard";
import { useCAODashboardStore } from "@/store/cao-dashboard/cao-dashboard.store";
import EmptyState from "@/components/cao-dashboard/EmptyState";
import ApproveRecommendationModal from "@/components/cao-dashboard/modals/ApproveRecommendationModal";
import RejectRecommendationModal from "@/components/cao-dashboard/modals/RejectRecommendationModal";

export default function PendingRecommendationsPage() {
  const recommendations = useCAODashboardStore((s) => s.recommendations);
  const loading = useCAODashboardStore((s) => s.recommendationsLoading);
  const fetchRecommendations = useCAODashboardStore((s) => s.fetchRecommendations);
  const activeModal = useCAODashboardStore((s) => s.activeModal);
  const department = useCAODashboardStore((s) => s.department);
  const searchQuery = useCAODashboardStore((s) => s.searchQuery);

  useEffect(() => {
    fetchRecommendations("PENDING");
  }, [fetchRecommendations]);

  // Client-side filtering by department and search query
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
    <>
      <div className="dash-kpi-row" style={{ gridTemplateColumns: "1fr", padding: "2rem 0" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--te-gray-4)" }}>Loading pending recommendations...</div>
        ) : filtered.length === 0 ? (
          <EmptyState title="No pending recommendations" description="New recommendations will appear here." />
        ) : (
          filtered.map((rec) => (
            <RecommendationCard
              key={rec.id}
              recommendation={rec}
            />
          ))
        )}
      </div>
      
      {activeModal === "approve-recommendation" && <ApproveRecommendationModal />}
      {activeModal === "reject-recommendation" && <RejectRecommendationModal />}
    </>
  );
}
