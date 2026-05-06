"use client";

import { useEffect } from "react";
import RecommendationCard from "@/components/cao-dashboard/RecommendationCard";
import { useCAODashboardStore } from "@/store/cao-dashboard/cao-dashboard.store";
import EmptyState from "@/components/cao-dashboard/EmptyState";
import ApproveRecommendationModal from "@/components/cao-dashboard/modals/ApproveRecommendationModal";
import RejectRecommendationModal from "@/components/cao-dashboard/modals/RejectRecommendationModal";

export default function AllRecommendationsPage() {
  const tenders = useCAODashboardStore((s) => s.tenders);
  const department = useCAODashboardStore((s) => s.department);
  const fetchTenders = useCAODashboardStore((s) => s.fetchTenders);
  const activeModal = useCAODashboardStore((s) => s.activeModal);

  useEffect(() => {
    fetchTenders();
  }, [fetchTenders, department]);

  return (
    <>
      <div className="dash-kpi-row" style={{ gridTemplateColumns: "1fr", padding: "2rem 0" }}>
        {tenders.length === 0 ? (
          <EmptyState title="No recommendations found" description="Recommendations will appear here." />
        ) : (
          tenders.map((tender) => (
            <RecommendationCard
              key={tender.id}
              tender={tender}
              status={tender.status === "pending" ? "pending" : tender.status === "approved" ? "accepted" : "rejected"}
              timestamp={tender.status !== "pending" ? new Date().toLocaleDateString() : undefined}
              reason={tender.status === "rejected" ? tender.rejectionReason : undefined}
            />
          ))
        )}
      </div>
      
      {activeModal === "approve-recommendation" && <ApproveRecommendationModal />}
      {activeModal === "reject-recommendation" && <RejectRecommendationModal />}
    </>
  );
}
