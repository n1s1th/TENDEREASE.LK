"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  FolderOpen, 
  Calendar,
  Copy,
  Check,
  ClipboardList,
  FileEdit
} from "lucide-react";
import { useRouter } from "next/navigation";

import { useEvaluationStore } from "@/store/evaluation/evaluation.store";

type StatusFilter = "ALL" | "PENDING_OPENING" | "OPEN" | "EVALUATION" | "COMPLETED" | "APPROVED";

interface Tender {
  id: string;
  tenderNo: string;
  title: string;
  category: string;
  status: string;
  closingDate: string;
  role: string;
}

interface AssignedTenderTableProps {
  title?: string;
  subtitle?: string;
}

export default function AssignedTenderTable({ title, subtitle }: AssignedTenderTableProps = {}) {
  const router = useRouter();
  const { 
    assignedTenders, 
    fetchAssignedTenders, 
    isLoading,
    totalPages = 1,
    totalElements = 0
  } = useEvaluationStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    }
    if (isFilterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFilterOpen]);

  useEffect(() => {
    // page parameter is 0-indexed in backend
    fetchAssignedTenders(searchTerm, statusFilter, currentPage - 1, itemsPerPage);
  }, [fetchAssignedTenders, searchTerm, statusFilter, currentPage]);

  useEffect(() => {
    const handleCloseFilter = () => setIsFilterOpen(false);
    window.addEventListener("quick-modal-open", handleCloseFilter);
    return () => window.removeEventListener("quick-modal-open", handleCloseFilter);
  }, []);

  const handleCopyId = (tenderId: string, tenderNo: string) => {
    const textToCopy = tenderNo || tenderId;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(tenderId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const paginatedTenders = assignedTenders as unknown as Tender[];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]";
      case "OPEN":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "PENDING_OPENING":
        return "bg-orange-50 text-[#9A3B12] border-orange-100";
      case "EVALUATION":
        return "bg-[#E2B93B]/10 text-[#E2B93B] border-[#E2B93B]/20";
      case "COMPLETED":
        return "bg-[#27AE60]/10 text-[#27AE60] border-[#27AE60]/20";
      default:
        return "bg-gray-50 text-gray-600 border-gray-100";
    }
  };

  const formatStatus = (status: string) => {
    if (status === "COMPLETED") return "Evaluation Completed";
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      {(title || subtitle) && (
        <div className="px-6 pt-6">
          {title && (
            <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-xs font-bold text-gray-400 mt-2.5 uppercase tracking-widest">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {/* Header Actions */}
      <div className="p-6 pt-4 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
          <input
            type="text"
            placeholder="Search by tender ID or title..."
            className="w-full pl-12 pr-4 py-3 bg-[#F8FAFC] border-none rounded-xl text-sm text-gray-700 focus:ring-2 focus:ring-[#9A3B12]/20 transition-all placeholder:text-gray-400 outline-none font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div ref={dropdownRef} className="flex items-center gap-3 relative">
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border transition-all font-bold text-xs uppercase tracking-widest ${
              isFilterOpen 
                ? "bg-[#953002]/5 text-[#953002] border-[#953002]/20" 
                : "border-gray-200 text-gray-600 hover:border-[#953002]/20 hover:bg-gray-50"
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{statusFilter === "ALL" ? "All Statuses" : formatStatus(statusFilter)}</span>
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
                  {status === "ALL" ? "All Statuses" : formatStatus(status)}
                  {statusFilter === status && <Check className="w-3.5 h-3.5 text-[#953002]" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table - Removed overflow-x-auto to prevent clipping of absolute menu */}
      <div className="relative min-w-[1000px]">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#9A3B12] text-white text-[13px] font-black uppercase tracking-wider">
              <th className="py-4 px-6 rounded-tl-lg text-center w-[15%]">Tender ID</th>
              <th className="py-4 px-6 text-center w-[35%]">Tender Title</th>
              <th className="py-4 px-6 text-center w-[10%]">Category</th>
              <th className="py-4 px-6 text-center w-[15%]">Status</th>
              <th className="py-4 px-6 text-center w-[15%]">Opening Date</th>
              <th className="py-4 px-6 rounded-tr-lg text-center w-[10%]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center">
                  <div className="w-8 h-8 border-2 border-[#9A3B12] border-t-transparent rounded-full animate-spin mx-auto"></div>
                </td>
              </tr>
            ) : paginatedTenders.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-500 font-bold italic">No tenders found matching your criteria...</td>
              </tr>
            ) : paginatedTenders.map((tender, idx) => (
              <tr key={tender.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-all group">
                <td className="px-6 py-6 text-center">
                  <span className="font-mono text-[12.5px] font-black text-gray-800 whitespace-nowrap">
                    {tender.tenderNo}
                  </span>
                </td>
                <td className="px-6 py-6 text-center">
                  <span className="text-[14px] font-bold text-gray-900 group-hover:text-[#9A3B12] transition-colors">{tender.title}</span>
                </td>
                <td className="px-6 py-6 text-center font-bold text-[13px] text-gray-500">{tender.category}</td>
                <td className="px-6 py-6 text-center">
                  <span className={`inline-flex px-4 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest border ${getStatusStyle(tender.status)} whitespace-nowrap`}>
                    {formatStatus(tender.status)}
                  </span>
                </td>
                <td className="px-6 py-6 text-center">
                  <div className="flex items-center justify-center gap-2.5 text-gray-600 whitespace-nowrap">
                    <Calendar className="w-4 h-4 text-[#953002]" />
                    <span className="text-[14px] font-bold">{tender.closingDate}</span>
                  </div>
                </td>
                <td className="px-6 py-6 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    {tender.status === "EVALUATION" || tender.status === "OPEN" ? (
                      <button 
                        onClick={() => router.push(`/tenders/${tender.id}/bid-evaluation`)}
                        className="p-2 rounded-xl text-gray-400 hover:text-[#9A3B12] hover:bg-orange-50 transition-all relative group/eye"
                      >
                        <ClipboardList className="w-5 h-5" />
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[10px] font-bold rounded opacity-0 group-hover/eye:opacity-100 pointer-events-none transition-all duration-200 shadow-lg whitespace-nowrap z-[110] after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-gray-900">
                          Evaluate Bids
                        </span>
                      </button>
                    ) : tender.status === "COMPLETED" ? (
                      <button 
                        onClick={() => router.push(`/reports-and-audit?tenderNo=${tender.tenderNo}`)}
                        className="p-2 rounded-xl text-gray-400 hover:text-[#9A3B12] hover:bg-orange-50 transition-all relative group/eye"
                      >
                        <FileEdit className="w-5 h-5" />
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[10px] font-bold rounded opacity-0 group-hover/eye:opacity-100 pointer-events-none transition-all duration-200 shadow-lg whitespace-nowrap z-[110] after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-gray-900">
                          Reports & Audit
                        </span>
                      </button>
                    ) : (
                      <button 
                        onClick={() => router.push(`/tenders/${tender.id}/bid-opening`)}
                        className="p-2 rounded-xl text-gray-400 hover:text-[#9A3B12] hover:bg-orange-50 transition-all relative group/eye"
                      >
                        <FolderOpen className="w-5 h-5" />
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[10px] font-bold rounded opacity-0 group-hover/eye:opacity-100 pointer-events-none transition-all duration-200 shadow-lg whitespace-nowrap z-[110] after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-gray-900">
                          Open Bids
                        </span>
                      </button>
                    )}
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyId(tender.id, tender.tenderNo);
                      }}
                      className={`p-2 rounded-xl transition-all relative group/copy ${
                        copiedId === tender.id 
                          ? "bg-green-50 text-green-600" 
                          : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      }`}
                    >
                      {copiedId === tender.id ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[10px] font-bold rounded opacity-0 group-hover/copy:opacity-100 pointer-events-none transition-all duration-200 shadow-lg whitespace-nowrap z-[110] after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-gray-900">
                        {copiedId === tender.id ? "Copied!" : "Copy ID"}
                      </span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-6 border-t border-gray-50 flex items-center justify-between bg-white/50">
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
          SHOWING {paginatedTenders.length} OF {totalElements} TENDERS
        </span>
        <div className="flex items-center gap-2">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="w-10 h-10 rounded-lg border border-gray-400 flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:border-gray-500 transition-all disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button 
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-10 h-10 rounded-lg flex items-center justify-center text-[13px] font-black transition-all ${
                currentPage === page 
                  ? 'bg-[#953002] text-white shadow-lg shadow-[#953002]/20' 
                  : 'border border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}

          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className="w-10 h-10 rounded-lg border border-gray-400 flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:border-gray-500 transition-all disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
