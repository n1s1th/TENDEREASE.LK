"use client";

import { Search, ChevronDown } from "lucide-react";

export default function DateRangeFilter() {
  return (
    <div className="dash-date-filter" id="date-range-filter">
      <button className="dash-date-filter-btn">
        <Search size={14} />
        Filter By Date range
        <ChevronDown size={14} />
      </button>
    </div>
  );
}
