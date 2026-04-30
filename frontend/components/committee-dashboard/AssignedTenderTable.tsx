"use client";

import { useEffect, useState, useMemo } from "react";
import { useEvaluationStore, selectAssignedTenders, selectEvaluationLoading } from "@/store/evaluation/evaluation.store";
import { Search, ChevronDown, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import EvaluationModal from "./EvaluationModal";
import SubmissionsModal from "./SubmissionsModal";
import { AssignedTender } from "@/lib/types/evaluation.types";

const ITEMS_PER_PAGE = 5;

export default function AssignedTenderTable() {
  const fetchAssignedTenders = useEvaluationStore((s) => s.fetchAssignedTenders);
  const tenders = useEvaluationStore(selectAssignedTenders);
  const isLoading = useEvaluationStore(selectEvaluationLoading);
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Tenders");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Modal state
  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [selectedTender, setSelectedTender] = useState<AssignedTender | null>(null);

  useEffect(() => {
    fetchAssignedTenders();
  }, [fetchAssignedTenders]);

  // Filtering Logic
  const filteredTenders = useMemo(() => {
    return tenders.filter((tender) => {
      const matchesSearch = 
        tender.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tender.title.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = 
        statusFilter === "All Tenders" || 
        tender.status.toUpperCase() === statusFilter.replace(" Tenders", "").toUpperCase();

      return matchesSearch && matchesStatus;
    });
  }, [tenders, searchTerm, statusFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredTenders.length / ITEMS_PER_PAGE);
  const paginatedTenders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTenders.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTenders, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "OPEN":
        return <span className="px-3 py-1 text-xs font-semibold text-blue-600 bg-white border border-blue-200 rounded-md">Open</span>;
      case "AWARDED":
        return <span className="px-3 py-1 text-xs font-semibold text-green-600 bg-white border border-green-200 rounded-md">Awarded</span>;
      case "PENDING_OPENING":
        return <span className="px-3 py-1 text-xs font-semibold text-purple-600 bg-white border border-purple-200 rounded-md">Pending Opening</span>;
      default:
        return <span className="px-3 py-1 text-xs font-semibold text-gray-600 bg-gray-100 rounded-md border border-gray-200">{status}</span>;
    }
  };

  const getRoleBadge = (role: string) => {
    return <span className="text-sm text-gray-600 font-medium uppercase">{role}</span>;
  };

  const getBidsBadge = (count: number) => {
    return <span className="px-2 py-1 text-xs font-semibold text-yellow-700 bg-yellow-50 border border-yellow-200 rounded">{count}</span>;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm mt-8 p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight text-gray-900">ASSIGNED TENDER STATUS</h2>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mt-1">WORKSPACE REAL-TIME DATA</p>
        </div>
        <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-xs font-bold tracking-wider">
          SHOWING {filteredTenders.length} TOTAL MATCHES
        </div>
      </div>

      <div className="flex justify-between gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by tender reference or title..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-full text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#9A3B12]/20"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="relative w-64 z-20">
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="w-full bg-white border border-gray-200 text-gray-900 font-bold text-sm rounded-xl px-5 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-[#9A3B12]/20 flex items-center justify-between shadow-sm"
          >
            <span>{statusFilter}</span>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
          </button>

          {isFilterOpen && (
            <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="py-1">
                {["All Tenders", "Open Tenders", "Awarded Tenders", "Pending Opening Tenders"].map((option) => (
                  <button
                    key={option}
                    className={`w-full text-left px-5 py-3 text-sm font-bold transition-colors ${
                      statusFilter === option 
                        ? 'bg-[#9A3B12] text-white' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setStatusFilter(option);
                      setIsFilterOpen(false);
                      setCurrentPage(1);
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto min-h-[400px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#9A3B12] text-white text-[13px] font-black uppercase tracking-wider">
              <th className="py-4 px-4 rounded-tl-lg">REFERENCE</th>
              <th className="py-4 px-4">TENDER TITLE</th>
              <th className="py-4 px-4 text-center">STATUS</th>
              <th className="py-4 px-4 text-center">OPENING DATE</th>
              <th className="py-4 px-4 text-center">ROLE</th>
              <th className="py-4 px-4 text-center">BIDS</th>
              <th className="py-4 px-4 text-center rounded-tr-lg">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="text-center py-20 text-gray-500 font-bold italic">Loading latest procurement data...</td>
              </tr>
            ) : paginatedTenders.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-20 text-slate-500 font-bold italic tracking-wide">No tenders found matching your criteria...</td>
              </tr>
            ) : paginatedTenders.map((tender, idx) => (
              <tr key={tender.id} className={`border-b border-gray-100 hover:bg-gray-50/80 transition-all ${idx % 2 === 0 ? 'bg-white' : 'bg-[#F2F4F7]'}`}>
                <td className="py-4 px-4">
                  <div className="font-bold text-sm text-gray-900">{tender.reference}</div>
                  <div className="text-[10px] text-gray-400 mt-1 uppercase font-semibold tracking-wider">REF ID</div>
                </td>
                <td className="py-4 px-4">
                  <div className="font-bold text-sm text-gray-900">{tender.title}</div>
                </td>
                <td className="py-4 px-4 text-center">{getStatusBadge(tender.status)}</td>
                <td className="py-4 px-4 text-center text-sm text-gray-600 font-medium">{tender.openingDate}</td>
                <td className="py-4 px-4 text-center">{getRoleBadge(tender.role)}</td>
                <td className="py-4 px-4 text-center">{getBidsBadge(tender.bidsCount)}</td>
                <td className="py-4 px-4 text-center">
                  <div className="flex items-center justify-center">
                    <button 
                      className="bg-[#9A3B12] text-white text-xs font-bold tracking-wider px-5 py-2 rounded-full shadow hover:bg-[#7a2f0e] transition-colors whitespace-nowrap min-w-[140px] text-center"
                      onClick={() => {
                        if (tender.status.toUpperCase() === "PENDING_OPENING") {
                          router.push(`/tenders/${tender.id}/bid-opening`);
                        } else {
                          setSelectedTender(tender);
                          if (tender.status.toUpperCase() === "AWARDED") {
                            setIsEvalModalOpen(true);
                          } else {
                            setIsSubModalOpen(true);
                          }
                        }
                      }}
                    >
                      {tender.status.toUpperCase() === "AWARDED" ? "Evaluate Bids" : 
                       tender.status.toUpperCase() === "PENDING_OPENING" ? "Open Bids" : "View Submissions"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          SHOWING {paginatedTenders.length} OF {filteredTenders.length} ENTRIES
        </div>
        <div className="flex gap-2">
          <button 
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className={`w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 transition-all ${currentPage === 1 ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button 
              key={page}
              onClick={() => handlePageChange(page)}
              className={`w-10 h-10 flex items-center justify-center rounded-lg text-[13px] font-black transition-all ${currentPage === page ? 'bg-[#9A3B12] text-white shadow-lg shadow-[#9A3B12]/20' : 'border border-gray-200 text-gray-500 hover:bg-gray-50'}`}
            >
              {page}
            </button>
          ))}

          <button 
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className={`w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 transition-all ${currentPage === totalPages || totalPages === 0 ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <EvaluationModal 
        tender={selectedTender}
        isOpen={isEvalModalOpen}
        onClose={() => setIsEvalModalOpen(false)}
      />

      <SubmissionsModal 
        tender={selectedTender}
        isOpen={isSubModalOpen}
        onClose={() => setIsSubModalOpen(false)}
      />
    </div>
  );
}
