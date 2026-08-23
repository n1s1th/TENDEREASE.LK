"use client";

import { Search } from "lucide-react";

interface Props {
  filters: {
    keyword: string;
    category: string;
    status: string;
    dateType: string;
    fromDate: string;
    toDate: string;
  };
  onFilterChange: (filters: any) => void;
  onReset: () => void;
}

const CATEGORIES = [
  "All Categories",
  "Construction",
  "IT & Technology",
  "Healthcare",
  "Transportation",
  "Education",
  "Energy",
  "Defense",
  "Agriculture",
  "Consulting",
];

const inputClass =
  "w-full border border-gray-100 bg-white rounded-xl px-4 py-3 text-sm font-normal font-sans text-black-2 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 cursor-pointer transition-all outline-none";

const labelClass = "text-[10px] font-semibold text-gray-3 uppercase tracking-[0.2em] px-1";

export default function TenderSearchBar({ filters, onFilterChange, onReset }: Props) {

  const handleInputChange = (field: string, value: string) => {
    onFilterChange({ ...filters, [field]: value });
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-premium border border-gray-100 p-8 sm:p-10 space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">

      {/* Top Search Row */}
      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center"
      >
        <div className="relative flex-1 group">
          <Search
            size={20}
            className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-3 group-focus-within:text-primary transition-colors"
          />
          <input
            type="text"
            placeholder="Search by Ref No, Title, Entity…"
            value={filters.keyword}
            onChange={(e) => handleInputChange("keyword", e.target.value)}
            className="
              w-full
              pl-14 pr-6 py-4
              rounded-2xl
              border border-gray-100
              bg-gray-5/30
              focus:bg-white
              focus:outline-none
              focus:ring-2
              focus:ring-primary/20
              focus:border-primary/30
              transition-all duration-300
              text-sm font-normal font-sans text-black-2
              placeholder:text-gray-3
              placeholder:font-normal
            "
          />
        </div>
      </form>

      {/* Filter Grid */}
      <div className="pt-8 border-t border-gray-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-8 items-end">

          {/* CATEGORY */}
          <div className="space-y-3">
            <label className={labelClass}>Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleInputChange("category", e.target.value)}
              className={inputClass}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* STATUS */}
          <div className="space-y-3">
            <label className={labelClass}>Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleInputChange("status", e.target.value)}
              className={inputClass}
            >
              <option>All Statuses</option>
              <option>Open</option>
              <option>Upcoming</option>
              <option>Closed</option>
            </select>
          </div>

          {/* DATE TYPE */}
          <div className="space-y-3">
            <label className={labelClass}>Date Type</label>
            <select
              value={filters.dateType}
              onChange={(e) => handleInputChange("dateType", e.target.value)}
              className={inputClass}
            >
              <option>None Selected</option>
              <option>Closing Date</option>
              <option>Published Date</option>
            </select>
          </div>

          {/* FROM */}
          <div className="space-y-3">
            <label className={labelClass}>Valid From</label>
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) => handleInputChange("fromDate", e.target.value)}
              className={inputClass}
            />
          </div>

          {/* TO */}
          <div className="space-y-3">
            <label className={labelClass}>Valid To</label>
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) => handleInputChange("toDate", e.target.value)}
              className={inputClass}
            />
          </div>

          {/* RESET */}
          <div className="flex justify-start lg:justify-end">
            <button
              onClick={onReset}
              className="
                w-full lg:w-auto
                bg-gray-5
                text-gray-2
                px-8 py-3
                rounded-xl
                text-xs font-semibold font-sans uppercase tracking-wider
                cursor-pointer
                transition-all duration-300
                hover:bg-gray-100
                hover:text-black-1
                active:scale-95
              "
            >
              Reset Filters
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
