"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  MoreVertical,
  Calendar,
  Edit2,
  Download,
  Link,
  Trash2,
  Check
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

interface AssignedTenderTableProps {
  title?: string;
  subtitle?: string;
}

export default function AssignedTenderTable({ title, subtitle }: AssignedTenderTableProps = {}) {
  const router = useRouter();
  const { assignedTenders, fetchAssignedTenders, isLoading } = useEvaluationStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchAssignedTenders();
  }, [fetchAssignedTenders]);

  // Handle click outside to close menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredTenders = useMemo(() => {
    return (assignedTenders as unknown as Tender[]).filter(tender => {
      const matchesSearch = 
        tender.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tender.tenderNo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || tender.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter, assignedTenders]);

  const totalPages = Math.ceil(filteredTenders.length / itemsPerPage) || 1;
  const paginatedTenders = filteredTenders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by tender ID or title..."
            className="w-full pl-12 pr-4 py-3 bg-[#F8FAFC] border-none rounded-xl text-sm text-gray-700 focus:ring-2 focus:ring-[#9A3B12]/20 transition-all placeholder:text-gray-400 outline-none font-medium"
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
              <th className="py-4 px-6 text-center w-[30%]">Tender Title</th>
              <th className="py-4 px-6 text-center w-[10%]">Category</th>
              <th className="py-4 px-6 text-center w-[15%]">Status</th>
              <th className="py-4 px-6 text-center w-[15%]">Opening Date</th>
              <th className="py-4 px-6 text-center w-[10%]">Role</th>
              <th className="py-4 px-6 rounded-tr-lg text-center w-[5%]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-20 text-center">
                  <div className="w-8 h-8 border-2 border-[#9A3B12] border-t-transparent rounded-full animate-spin mx-auto"></div>
                </td>
              </tr>
            ) : paginatedTenders.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-500 font-bold italic">No tenders found matching your criteria...</td>
              </tr>
            ) : paginatedTenders.map((tender, idx) => (
              <tr key={tender.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-all group">
                <td className="px-6 py-6 text-center">
                  <span className="font-mono text-[12px] font-black text-gray-500 bg-gray-100/80 px-3 py-1.5 rounded-xl border border-gray-200 whitespace-nowrap">
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
                <td className="px-6 py-6 text-center text-xs font-black text-gray-400 uppercase tracking-tight whitespace-nowrap">{tender.role}</td>
                <td className="px-6 py-6 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button 
                      onClick={() => router.push(`/tenders/${tender.id}/bid-opening`)}
                      className="p-2 rounded-xl text-gray-400 hover:text-[#9A3B12] hover:bg-orange-50 transition-all"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    
                    <div className="relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === tender.id ? null : tender.id);
                        }}
                        className={`p-2 rounded-xl transition-all ${
                          openMenuId === tender.id 
                            ? "bg-orange-100 text-[#9A3B12] ring-2 ring-[#9A3B12]/20" 
                            : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        }`}
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {openMenuId === tender.id && (
                        <div 
                          ref={menuRef}
                          className="absolute right-0 mt-3 w-44 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[100] py-2 animate-in fade-in zoom-in-95 duration-200"
                          style={{ top: '100%' }}
                        >
                          <button className="w-full flex items-center gap-3 px-4 py-2 text-[13px] font-bold text-gray-600 hover:bg-orange-50 hover:text-[#9A3B12] transition-colors">
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>
                          <button className="w-full flex items-center gap-3 px-4 py-2 text-[13px] font-bold text-gray-600 hover:bg-orange-50 hover:text-[#9A3B12] transition-colors">
                            <Download className="w-4 h-4" />
                            Specs
                          </button>
                          <button className="w-full flex items-center gap-3 px-4 py-2 text-[13px] font-bold text-gray-600 hover:bg-orange-50 hover:text-[#9A3B12] transition-colors">
                            <Link className="w-4 h-4" />
                            Copy ID
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-6 border-t border-gray-50 flex items-center justify-between bg-white/50">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          SHOWING {paginatedTenders.length} OF {filteredTenders.length} TENDERS
        </span>
        <div className="flex items-center gap-2">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-all disabled:opacity-30 disabled:hover:bg-transparent"
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
            className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-all disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
