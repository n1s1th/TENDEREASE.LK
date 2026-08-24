"use client";

import { useEffect, useState } from "react";
import Pagination from "@/components/cao-dashboard/Pagination";
import RecommendationCard from "@/components/cao-dashboard/RecommendationCard";
import { useCAODashboardStore } from "@/store/cao-dashboard/cao-dashboard.store";
import EmptyState from "@/components/cao-dashboard/EmptyState";
import ApproveRecommendationModal from "@/components/cao-dashboard/modals/ApproveRecommendationModal";
import RejectRecommendationModal from "@/components/cao-dashboard/modals/RejectRecommendationModal";

export default function AllRecommendationsPage() {
  const recommendations = useCAODashboardStore((s) => s.recommendations);
  const loading = useCAODashboardStore((s) => s.recommendationsLoading);
  const fetchRecommendations = useCAODashboardStore((s) => s.fetchRecommendations);
  const activeModal = useCAODashboardStore((s) => s.activeModal);
  const department = useCAODashboardStore((s) => s.department);
  const searchQuery = useCAODashboardStore((s) => s.searchQuery);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;


  useEffect(() => { fetchRecommendations(); }, [fetchRecommendations]);
  useEffect(() => { setCurrentPage(1); }, [department, searchQuery]);

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

  
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  return (
    <>
      <div className="dash-kpi-row" style={{ gridTemplateColumns: "1fr", padding: "2rem 0" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--te-gray-4)" }}>Loading recommendations...</div>
        ) : paginated.length === 0 ? (
          <EmptyState title="No recommendations found" description="Recommendations will appear here." />
        ) : (
          paginated.map((rec) => (
            <RecommendationCard
              key={rec.id}
              recommendation={rec}
            />
          ))
        )}
        <Pagination pagination={{ currentPage, totalPages, pageSize, totalItems }} onPageChange={setCurrentPage} />
      </div>
      
      {activeModal === "approve-recommendation" && <ApproveRecommendationModal />}
      {activeModal === "reject-recommendation" && <RejectRecommendationModal />}
    </>
  );
}
