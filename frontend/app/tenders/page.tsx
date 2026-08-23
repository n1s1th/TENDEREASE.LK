"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import TenderLayout from "@/components/tender/TenderLayout";
import TenderTable from "@/components/tender/TenderTable";
import TenderSearchBar from "@/components/tender/TenderSearchBar";
import TenderPagination from "@/components/tender/TenderPagination";
import TenderListTabs, { TenderListTab } from "@/components/tender/TenderListTabs";
import { getTenders } from "@/services/tender.service";
import { useAuthStore, useSavedTendersStore } from "@/store";
import { useSearchParams } from "next/navigation";

const INITIAL_FILTERS = {
  keyword: "",
  category: "All Categories",
  status: "All Statuses",
  dateType: "None Selected",
  fromDate: "",
  toDate: "",
};

/** Matches the officer dashboard's live search without a request per keystroke. */
const SEARCH_DEBOUNCE_MS = 300;

function TendersPageContent() {
  const searchParams = useSearchParams();
  const [tenders, setTenders] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [activeTab, setActiveTab] = useState<TenderListTab>(() => {
    const tab = searchParams.get("tab");
    return tab === "closed" || tab === "saved" ? tab : "open";
  });

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const savedTenders = useSavedTendersStore((s) => s.savedTenders);
  const savedLoading = useSavedTendersStore((s) => s.loading);
  const fetchSavedTenders = useSavedTendersStore((s) => s.fetchTenders);

  const [filters, setFilters] = useState(() => {
    const search = searchParams.get("search") || "";
    const cat = searchParams.get("category") || "All Categories";
    return {
      ...INITIAL_FILTERS,
      keyword: search,
      category: cat,
    };
  });

  // Debounced copy of the filters — typing updates `filters` instantly so the
  // input stays responsive, while the fetch waits for a pause.
  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedFilters(filters), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [filters]);

  // Synchronize filter state when URL search parameters change
  useEffect(() => {
    const search = searchParams.get("search") || "";
    const cat = searchParams.get("category") || "All Categories";
    setFilters((prev) => ({
      ...prev,
      keyword: search,
      category: cat,
    }));

    const tab = searchParams.get("tab");
    if (tab === "open" || tab === "closed" || tab === "saved") {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Any change to the query or the active tab restarts paging from page 1.
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedFilters, activeTab]);

  // Saved tenders load once when the tab opens; the keyword narrows them locally.
  useEffect(() => {
    if (activeTab === "saved") {
      fetchSavedTenders();
    }
  }, [activeTab, fetchSavedTenders]);

  useEffect(() => {
    if (activeTab === "saved") return;

    let cancelled = false;

    async function fetchTenders() {
      setLoading(true);
      try {
        // Backend pagination is 0-indexed
        const data = await getTenders(currentPage - 1, 10, {
          ...debouncedFilters,
          tab: activeTab,
        });
        if (cancelled) return;

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
        if (!cancelled) {
          setTenders([]);
          setTotalCount(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchTenders();
    return () => {
      cancelled = true;
    };
  }, [currentPage, debouncedFilters, activeTab]);

  // Saved tenders come back as one list, so the keyword narrows them here.
  const visibleSaved = useMemo(() => {
    const keyword = debouncedFilters.keyword.trim().toLowerCase();
    if (!keyword) return savedTenders;
    return savedTenders.filter((t: any) =>
      [t.title, t.tenderNumber, t.departmentName]
        .filter(Boolean)
        .some((field: string) => field.toLowerCase().includes(keyword))
    );
  }, [savedTenders, debouncedFilters.keyword]);

  const handleReset = () => {
    setFilters(INITIAL_FILTERS);
    setCurrentPage(1);
  };

  const isSavedTab = activeTab === "saved";
  const showLoading = isSavedTab ? savedLoading : loading;
  const rows = isSavedTab ? visibleSaved : tenders;
  const resultCount = isSavedTab ? visibleSaved.length : totalCount;

  return (
    <TenderLayout>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-10 py-10 space-y-12">

        {/* Header Section */}
        <div className="relative">
          <div className="absolute -left-4 top-0 w-1 h-12 bg-primary rounded-full"></div>
          <div className="space-y-2 pl-6">
            <h1 className="text-4xl font-extrabold text-black-1 tracking-tight">Tender Portal</h1>
            <p className="text-gray-2 font-normal">Explore and participate in <strong className="text-black-2 font-semibold">high-value strategic procurement</strong> opportunities.</p>
          </div>
        </div>

        {/* Search & Filters */}
        <TenderSearchBar
          filters={filters}
          onFilterChange={setFilters}
          onReset={handleReset}
        />

        {/* Results Section */}
        <div className="space-y-8 animate-in fade-in duration-700">
          <div className="flex justify-between items-end px-2">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-black-1 uppercase tracking-tight">Search Results</h2>
              <div className="h-1 w-12 bg-secondary rounded-full"></div>
            </div>
            <span className="text-xs font-semibold text-gray-3 uppercase tracking-widest">
              {showLoading ? "Synchronizing..." : (
                <><strong className="text-black-1 font-bold text-sm normal-case tracking-normal">{resultCount}</strong> Tenders Available</>
              )}
            </span>
          </div>

          {/* Open / Closed / Saved tabs */}
          <TenderListTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            showSaved={isAuthenticated}
          />

          {showLoading ? (
            <div className="py-32 flex flex-col items-center justify-center space-y-4 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <p className="text-sm font-semibold text-gray-3 uppercase tracking-[0.2em] animate-pulse">Fetching Real-Time Data</p>
            </div>
          ) : (
            <div className="space-y-6">
              <TenderTable data={rows} />

              {!isSavedTab && (
                <TenderPagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(totalCount / 10) || 1}
                  totalItems={totalCount}
                  onPageChange={setCurrentPage}
                />
              )}
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
