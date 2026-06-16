"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Calendar
} from "lucide-react";
import { useRouter } from "next/navigation";

import { useEvaluationStore } from "@/store/evaluation/evaluation.store";

type StatusFilter = "ALL" | "PENDING_OPENING" | "OPEN" | "EVALUATION" | "COMPLETED";

interface Tender {
  id: string;
  tenderNo: string;
  title: string;
  category: string;
  status: string;
  closingDate: string;
  role: string;
}

export default function AssignedTenderTable() {
  const router = useRouter();
  const { 
    assignedTenders, 
    assignedTendersTotalPages,
    assignedTendersTotalElements,
    fetchAssignedTenders, 
    isLoading 
  } = useEvaluationStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const itemsPerPage = 8;

  // Debounce search term
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    // Reset to page 1 when filters change
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    // Page is 0-indexed on the backend
    fetchAssignedTenders(debouncedSearch, statusFilter, currentPage - 1, itemsPerPage);
  }, [fetchAssignedTenders, debouncedSearch, statusFilter, currentPage]);

  const totalPages = assignedTendersTotalPages || 1;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-green-50 text-green-700 border-green-100";
      case "PENDING_OPENING":
        return "bg-orange-50 text-[#9A3B12] border-orange-100";
      case "EVALUATION":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "COMPLETED":
        return "bg-gray-50 text-gray-700 border-gray-100";
      default:
        return "bg-gray-50 text-gray-600 border-gray-100";
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      {/* Header Actions */}
      <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by tender ID or title..."
            className="w-full pl-12 pr-4 py-3 bg-[#F8FAFC] border-none rounded-xl text-gray-700 text-[13px] focus:ring-2 focus:ring-[#9A3B12]/20 transition-all placeholder:text-gray-400 outline-none font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3 relative">
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl border transition-all font-bold text-xs uppercase tracking-widest ${
              isFilterOpen 
                ? "bg-[#953002]/5 text-[#953002] border-[#953002]/20" 
                : "border-gray-200 text-gray-600 hover:border-[#953002]/20 hover:bg-gray-50"
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>{statusFilter === "ALL" ? "All Status" : formatStatus(statusFilter)}</span>
          </button>

          {isFilterOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[100] py-2 animate-in fade-in zoom-in-95 duration-200">
              {["ALL", "PENDING_OPENING", "OPEN", "EVALUATION", "COMPLETED"].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setStatusFilter(status as StatusFilter);
                    setIsFilterOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left text-[11px] font-black uppercase tracking-widest transition-colors flex items-center justify-between ${
                    statusFilter === status 
                      ? "bg-[#953002]/5 text-[#953002]" 
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {status === "ALL" ? "All Status" : formatStatus(status)}
                  {statusFilter === status && <div className="w-1.5 h-1.5 rounded-full bg-[#953002]" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="w-full overflow-hidden">
        <table className="w-full table-fixed border-collapse">
          <thead>
            <tr className="bg-[#F8FAFC]">
              <th className="px-3 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] text-center w-[10%]">ID</th>
              <th className="px-3 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] text-left w-[35%]">Tender Title</th>
              <th className="px-3 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] text-center w-[20%]">Category</th>
              <th className="px-3 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] text-center w-[13%]">Status</th>
              <th className="px-3 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] text-center w-[12%]">Closing</th>
              <th className="px-3 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] text-center w-[0%] hidden">Role</th>
              <th className="px-3 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] text-center w-[10%]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center">
                  <div className="w-8 h-8 border-2 border-[#9A3B12] border-t-transparent rounded-full animate-spin mx-auto"></div>
                </td>
              </tr>
            ) : assignedTenders.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-20 text-slate-500 font-bold italic tracking-wide">No tenders found matching your criteria...</td>
              </tr>
            ) : (assignedTenders as unknown as Tender[]).map((tender, idx) => (
              <tr key={tender.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-all group">
                <td className="px-3 py-4 text-center">
                  <span className="font-mono text-[10px] font-black text-gray-500 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100 truncate block" title={tender.tenderNo}>
                    {tender.tenderNo}
                  </span>
                </td>
                <td className="px-3 py-4 text-left">
                  <span className="text-[12px] font-bold text-gray-900 group-hover:text-[#9A3B12] transition-colors line-clamp-1 block truncate" title={tender.title}>
                    {tender.title}
                  </span>
                </td>
                <td className="px-3 py-4 text-center font-bold text-[11px] text-gray-500" title={tender.category}>{tender.category}</td>
                <td className="px-3 py-4 text-center">
                  <span className={`inline-flex px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${getStatusStyle(tender.status)} truncate`}>
                    {formatStatus(tender.status).replace('Opening', 'Opn.')}
                  </span>
                </td>
                <td className="px-3 py-4 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-gray-600">
                    <Calendar className="w-3 h-3 text-[#953002]" />
                    <span className="text-[11px] font-bold whitespace-nowrap">{tender.closingDate}</span>
                  </div>
                </td>
                <td className="px-3 py-4 text-center">
                  <button 
                    onClick={() => router.push(`/tenders/${tender.tenderNo}/bid-opening`)}
                    className="flex items-center justify-center gap-2 mx-auto px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-[#9A3B12] hover:bg-orange-50 border border-gray-100 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {assignedTendersTotalElements > 0 && (
        <div className="p-6 border-t border-gray-50 flex items-center justify-between bg-white/50">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
            Showing <span className="text-gray-900">{assignedTenders.length}</span> of <span className="text-gray-900">{assignedTendersTotalElements}</span> tenders
          </p>
          <div className="flex items-center gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className={`p-2.5 rounded-xl border transition-colors ${currentPage === 1 ? 'border-gray-100 text-gray-300 opacity-50' : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'}`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // Show first, last, current, and adjacent pages
              if (
                page === 1 || 
                page === totalPages || 
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-xl border font-bold transition-colors flex items-center justify-center text-sm ${
                      currentPage === page
                        ? 'bg-[#953002] text-white border-[#953002]'
                        : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              }
              // Show ellipsis
              if (
                page === currentPage - 2 || 
                page === currentPage + 2
              ) {
                return <span key={page} className="px-1 text-gray-400">...</span>;
              }
              return null;
            })}

            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className={`p-2.5 rounded-xl border transition-colors ${currentPage === totalPages ? 'border-gray-100 text-gray-300 opacity-50' : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'}`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
