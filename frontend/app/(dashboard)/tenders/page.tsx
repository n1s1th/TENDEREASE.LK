"use client";

import { useState, useMemo } from "react";
import { mockTenders } from "@/lib/mock-tenders";

import TenderSearchBar from "@/components/tender/TenderSearchBar";
import TenderTabs from "@/components/tender/TenderTabs";
import TenderTable from "@/components/tender/TenderTable";
import TenderPagination from "@/components/tender/TenderPagination";

export default function TendersPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 9;

  // ✅ Filter by tab
  const filtered = useMemo(() => {
    if (activeTab === "All") return mockTenders;
    return mockTenders.filter((t) => t.status === activeTab);
  }, [activeTab]);

  // ✅ Pagination calculations
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = currentPage * itemsPerPage;
    return filtered.slice(start, end);
  }, [filtered, currentPage]);

  // ✅ Reset page when tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  return (
    <div className="px-6 py-8 space-y-8">

      {/* Page Title */}
      <h1 className="text-3xl font-bold">
        Find Government <span className="text-[#953002]">Tenders</span>
      </h1>

      {/* Search */}
      <TenderSearchBar />

      {/* Tabs */}
      <TenderTabs
        activeTab={activeTab}
        setActiveTab={handleTabChange}
      />

      {/* Table */}
      <TenderTable data={paginatedData} />

      {/* Pagination */}
      <TenderPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
      />

    </div>
  );
}
