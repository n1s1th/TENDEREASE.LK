"use client";

import { useState } from "react";
import { Calendar, ChevronDown, Check } from "lucide-react";

interface DateRangeFilterProps {
  value?: string;
  onChange?: (value: string) => void;
}

export default function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const presets = [
    { label: "Last 30 Days", value: "last_30_days" },
    { label: "Last 90 Days", value: "last_90_days" },
    { label: "This Year", value: "this_year" },
    { label: "All Time", value: "all_time" },
  ];

  const months = [
    { label: "Jan", value: "month_01" }, { label: "Feb", value: "month_02" },
    { label: "Mar", value: "month_03" }, { label: "Apr", value: "month_04" },
    { label: "May", value: "month_05" }, { label: "Jun", value: "month_06" },
    { label: "Jul", value: "month_07" }, { label: "Aug", value: "month_08" },
    { label: "Sep", value: "month_09" }, { label: "Oct", value: "month_10" },
    { label: "Nov", value: "month_11" }, { label: "Dec", value: "month_12" },
  ];

  const getCurrentLabel = () => {
    const preset = presets.find(p => p.value === value);
    if (preset) return preset.label;
    const month = months.find(m => m.value === value);
    if (month) return `${month.label} 2026`;
    return "Select Date Range";
  };

  return (
    <div className="relative" id="date-range-filter">
      <button 
        className="dash-date-filter-btn flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:border-amber-400 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Calendar size={16} className="text-amber-500" />
        <span className="text-sm font-medium text-slate-700">{getCurrentLabel()}</span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-100 rounded-xl shadow-xl z-20 p-3 animate-in fade-in slide-in-from-top-2">
            <div className="mb-3">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">Presets</h4>
              <div className="grid grid-cols-2 gap-1">
                {presets.map(p => (
                  <button
                    key={p.value}
                    className={`text-left px-3 py-1.5 text-xs rounded-md transition-colors flex items-center justify-between ${
                      value === p.value ? 'bg-amber-50 text-amber-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                    onClick={() => {
                      onChange?.(p.value);
                      setIsOpen(false);
                    }}
                  >
                    {p.label}
                    {value === p.value && <Check size={10} />}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">Specific Month (2026)</h4>
              <div className="grid grid-cols-3 gap-1">
                {months.map(m => (
                  <button
                    key={m.value}
                    className={`px-2 py-1.5 text-xs rounded-md transition-colors ${
                      value === m.value ? 'bg-amber-500 text-white font-semibold' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                    onClick={() => {
                      onChange?.(m.value);
                      setIsOpen(false);
                    }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
