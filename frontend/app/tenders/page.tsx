"use client";

import { useState, useEffect, Suspense } from "react";
import TenderLayout from "@/components/tender/TenderLayout";
import TenderTable from "@/components/tender/TenderTable";
import TenderSearchBar from "@/components/tender/TenderSearchBar";
import TenderPagination from "@/components/tender/TenderPagination";
import { getTenders } from "@/services/tender.service";
import { useSearchParams } from "next/navigation";

const INITIAL_FILTERS = {
  keyword: "",
  category: "All Categories",
  status: "All Statuses",
  dateType: "None Selected",
  fromDate: "",
  toDate: "",
};

function TendersPageContent() {
  const searchParams = useSearchParams();
  const [tenders, setTenders] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  
  const [filters, setFilters] = useState(() => {
    const search = searchParams.get("search") || "";
    const cat = searchParams.get("category") || "All Categories";
    return {
      ...INITIAL_FILTERS,
      keyword: search,
      category: cat,
    };
  });
  
  const [triggerFetch, setTriggerFetch] = useState(0);

  // Synchronize filter state when URL search parameters change
  useEffect(() => {
    const search = searchParams.get("search") || "";
    const cat = searchParams.get("category") || "All Categories";
    setFilters((prev) => ({
      ...prev,
      keyword: search,
      category: cat,
    }));
    setCurrentPage(1);
    setTriggerFetch((prev) => prev + 1);
  }, [searchParams]);

  useEffect(() => {
    async function fetchTenders() {
      setLoading(true);
      try {
        // Backend pagination is 0-indexed
        const data = await getTenders(currentPage - 1, 10, filters);

        // Handle both Array response and Page object response
        if (Array.isArray(data)) {
          setTenders(data);
          setTotalCount(data.length);
        } else if (data && data.content) {
          setTenders(data.content);
          setTotalCount(data.totalElements || data.content.length);
        } else {
          setTenders([]);
          setTotalCount(0);
        }
      } catch (error) {
        console.error("❌ Failed to fetch tenders:", error);
        setTenders([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    }
    fetchTenders();
  }, [currentPage, triggerFetch]);

  const handleSearch = () => {
    setCurrentPage(1);
    setTriggerFetch(prev => prev + 1);
  };

  const handleReset = () => {
    setFilters(INITIAL_FILTERS);
    setCurrentPage(1);
    setTriggerFetch(prev => prev + 1);
  };

  return (
    <TenderLayout>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-10 py-10 space-y-12">

        {/* Header Section */}
        <div className="relative">
          <div className="absolute -left-4 top-0 w-1 h-12 bg-primary rounded-full"></div>
          <div className="space-y-2 pl-6">
            <h1 className="text-4xl font-black text-black-1 tracking-tight">Tender Portal</h1>
            <p className="text-gray-2 font-medium">Explore and participate in high-value strategic procurement opportunities.</p>
          </div>
        </div>

        {/* Search & Filters */}
        <TenderSearchBar
          filters={filters}
          onFilterChange={setFilters}
          onSearch={handleSearch}
          onReset={handleReset}
        />

        {/* Results Section */}
        <div className="space-y-8 animate-in fade-in duration-700">
          <div className="flex justify-between items-end px-2">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-black-1 uppercase tracking-tight">Search Results</h2>
              <div className="h-1 w-12 bg-secondary rounded-full"></div>
            </div>
            <span className="text-xs font-black text-gray-3 uppercase tracking-widest">
              {loading ? "Synchronizing..." : `${totalCount} Tenders Available`}
            </span>
          </div>

          {loading ? (
            <div className="py-32 flex flex-col items-center justify-center space-y-4 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <p className="text-sm font-black text-gray-3 uppercase tracking-[0.2em] animate-pulse">Fetching Real-Time Data</p>
            </div>
          ) : (
            <div className="space-y-6">
              <TenderTable data={tenders} />

              <TenderPagination
                currentPage={currentPage}
                totalPages={Math.ceil(totalCount / 10) || 1}
                totalItems={totalCount}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>
    </TenderLayout>
  );
}

export default function TendersPage() {
  return (
    <Suspense fallback={
      <TenderLayout>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-10 py-10 text-center text-gray-2">
          Loading Tender Portal...
        </div>
      </TenderLayout>
    }>
      <TendersPageContent />
    </Suspense>
  );
}
