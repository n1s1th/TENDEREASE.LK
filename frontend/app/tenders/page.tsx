"use client";

import { useState, useEffect } from "react";
import TenderLayout from "@/components/tender/TenderLayout";
import TenderTable from "@/components/tender/TenderTable";
import TenderSearchBar from "@/components/tender/TenderSearchBar";
import TenderPagination from "@/components/tender/TenderPagination";
import { getTenders } from "@/services/tender.service";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Bookmark, Search } from "lucide-react";
import { useSavedTendersStore } from "@/store/saved-tenders.store";
import { useAuthStore } from "@/store";

const INITIAL_FILTERS = {
  keyword: "",
  status: "All Statuses",
  dateType: "None Selected",
  fromDate: "",
  toDate: "",
};

export default function TendersPage() {
  const [tenders, setTenders] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [debouncedFilters, setDebouncedFilters] = useState(INITIAL_FILTERS);
  const [activeTab, setActiveTab] = useState("open");
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [filters]);

  useEffect(() => {
    async function fetchTenders() {
      if (activeTab === "saved") return;

      setLoading(true);
      try {
        const currentFilters = { ...debouncedFilters };
        if (activeTab === "open") {
          currentFilters.status = "All Statuses";
        } else if (activeTab === "closed") {
          currentFilters.status = "CLOSED";
        }

        // Backend pagination is 0-indexed
        const data = await getTenders(currentPage - 1, 10, currentFilters);

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
  }, [currentPage, debouncedFilters, activeTab]);

  const handleReset = () => {
    setFilters(INITIAL_FILTERS);
    setCurrentPage(1);
  };

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
          <Tabs defaultValue="open" value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end px-2 gap-4">
              <div className="space-y-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-black-1 uppercase tracking-tight">Search Results</h2>
                  <div className="h-1 w-12 bg-secondary rounded-full"></div>
                </div>

                <TabsList className="bg-gray-5/50 border border-gray-100 p-1 rounded-xl">
                  <TabsTrigger value="open" className="rounded-lg font-bold text-xs uppercase tracking-widest px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    Open Tenders
                  </TabsTrigger>
                  <TabsTrigger value="closed" className="rounded-lg font-bold text-xs uppercase tracking-widest px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    Closed Tenders
                  </TabsTrigger>
                  {isAuthenticated && (
                    <TabsTrigger value="saved" className="rounded-lg font-bold text-xs uppercase tracking-widest px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      <Bookmark size={14} className="mr-2 inline" /> Saved Tenders
                    </TabsTrigger>
                  )}
                </TabsList>
              </div>

              <span className="text-xs font-black text-gray-3 uppercase tracking-widest mb-2 sm:mb-0">
                {loading ? "Synchronizing..." : activeTab === "saved" ? "" : `${totalCount} Tenders Available`}
              </span>
            </div>

            <TabsContent value="open" className="m-0 focus-visible:outline-none">
              {loading ? (
                <div className="py-32 flex flex-col items-center justify-center space-y-4 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
                  <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                  <p className="text-sm font-black text-gray-3 uppercase tracking-[0.2em] animate-pulse">Fetching Real-Time Data</p>
                </div>
              ) : tenders.length === 0 ? (
                <div className="py-32 flex flex-col items-center justify-center space-y-4 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
                  <div className="w-16 h-16 bg-gray-5 rounded-2xl flex items-center justify-center mb-2">
                    <Search size={24} className="text-gray-3" />
                  </div>
                  <p className="text-sm font-black text-black-2 uppercase tracking-widest">No Results</p>
                  <p className="text-gray-2 text-sm font-medium text-center max-w-sm">
                    No tenders found matching your criteria.
                  </p>
                  <button onClick={handleReset} className="mt-4 text-primary font-semibold text-xs uppercase tracking-widest hover:underline">Clear Filters</button>
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
            </TabsContent>

            <TabsContent value="closed" className="m-0 focus-visible:outline-none">
              {loading ? (
                <div className="py-32 flex flex-col items-center justify-center space-y-4 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
                  <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                  <p className="text-sm font-black text-gray-3 uppercase tracking-[0.2em] animate-pulse">Fetching Real-Time Data</p>
                </div>
              ) : tenders.length === 0 ? (
                <div className="py-32 flex flex-col items-center justify-center space-y-4 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
                  <div className="w-16 h-16 bg-gray-5 rounded-2xl flex items-center justify-center mb-2">
                    <Search size={24} className="text-gray-3" />
                  </div>
                  <p className="text-sm font-black text-black-2 uppercase tracking-widest">No Results</p>
                  <p className="text-gray-2 text-sm font-medium text-center max-w-sm">
                    No closed tenders found matching your criteria.
                  </p>
                  <button onClick={handleReset} className="mt-4 text-primary font-semibold text-xs uppercase tracking-widest hover:underline">Clear Filters</button>
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
            </TabsContent>

            {isAuthenticated && (
              <TabsContent value="saved" className="m-0 focus-visible:outline-none">
                <SavedTendersView />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </TenderLayout>
  );
}

function SavedTendersView() {
  const { savedTenders } = useSavedTendersStore();
  const { user } = useAuthStore();
  
  // Deduplicate and filter by logged-in user to prevent key collision errors
  const mySavedTenders = user?.id 
    ? Array.from(new Map(
        savedTenders
          .filter(t => t.userId === user.id)
          .map(t => [t.id, t])
      ).values())
    : [];

  if (mySavedTenders.length === 0) {
    return (
      <div className="py-32 flex flex-col items-center justify-center space-y-4 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
        <div className="w-16 h-16 bg-gray-5 rounded-2xl flex items-center justify-center mb-2">
          <Bookmark size={24} className="text-gray-3" />
        </div>
        <p className="text-sm font-black text-black-2 uppercase tracking-widest">No Saved Tenders</p>
        <p className="text-gray-2 text-sm font-medium text-center max-w-sm">
          You haven't saved any tenders yet. Click the bookmark icon on any tender details page to save it for later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <TenderTable data={mySavedTenders} />
    </div>
  );
}
