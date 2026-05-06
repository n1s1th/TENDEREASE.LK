"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PaginationState } from "@/lib/types/cao-dashboard.types";

interface PaginationProps {
  pagination: PaginationState;
  onPageChange: (page: number) => void;
}

export default function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { currentPage, totalPages } = pagination;

  if (totalPages <= 1) return null;

  const getPageNumbers = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="dash-pagination" id="pagination">
      <button
        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-600 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:not-disabled:text-[#FFB401] hover:not-disabled:border-[#FFB401]"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft size={14} /> Previous
      </button>

      {getPageNumbers().map((page, i) =>
        page === "..." ? (
          <span key={`ellipsis-${i}`} className="px-2 text-slate-400">
            …
          </span>
        ) : (
          <button
            key={page}
            className={`px-3 py-1.5 text-sm font-bold rounded-lg border transition-all duration-200 ${page === currentPage ? "bg-[#FFB401] text-slate-900 border-[#FFB401] shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:text-[#FFB401] hover:border-[#FFB401]"}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ),
      )}

      <button
        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-600 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:not-disabled:text-[#FFB401] hover:not-disabled:border-[#FFB401]"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next <ChevronRight size={14} />
      </button>
    </div>
  );
}
