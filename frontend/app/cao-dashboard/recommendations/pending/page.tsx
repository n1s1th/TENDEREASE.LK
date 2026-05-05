"use client";

import { useEffect } from "react";
import RecommendationCard from "@/components/cao-dashboard/RecommendationCard";
import { useCAODashboardStore } from "@/store/cao-dashboard/cao-dashboard.store";
import EmptyState from "@/components/cao-dashboard/EmptyState";
import ApproveRecommendationModal from "@/components/cao-dashboard/modals/ApproveRecommendationModal";
import RejectRecommendationModal from "@/components/cao-dashboard/modals/RejectRecommendationModal";

export default function PendingRecommendationsPage() {
  const tenders = useCAODashboardStore((s) => s.tenders);
  const department = useCAODashboardStore((s) => s.department);
  const fetchTenders = useCAODashboardStore((s) => s.fetchTenders);
  const activeModal = useCAODashboardStore((s) => s.activeModal);

  useEffect(() => {
    fetchTenders();
  }, [fetchTenders, department]);

  const pending = tenders.filter((t) => t.status === "pending");

  return (
    <>
      <div className="dash-kpi-row" style={{ gridTemplateColumns: "1fr", padding: "2rem 0" }}>
        {pending.length === 0 ? (
          <EmptyState title="No pending recommendations" description="Recommendations submitted by officers will appear here." />
        ) : (
          pending.map((tender) => (
            <RecommendationCard
              key={tender.id}
              tender={tender}
              status="pending"
            />
          ))
        )}
      </div>
      
      {activeModal === "approve-recommendation" && <ApproveRecommendationModal />}
      {activeModal === "reject-recommendation" && <RejectRecommendationModal />}
    </>
  );
}
