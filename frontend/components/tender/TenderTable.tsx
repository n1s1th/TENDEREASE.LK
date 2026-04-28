"use client";

import { useRouter } from "next/navigation";
import StatusBadge from "./StatusBadge";

interface Props {
  data: any[];
}

function formatCurrency(value: any): string {
  if (!value && value !== 0) return "---";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "---";
  return `LKR ${num.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(value: any): string {
  if (!value) return "TBA";
  try {
    const date = new Date(value);
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return "TBA";
  }
}

export default function TenderTable({ data }: Props) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-[2rem] shadow-premium border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-700 delay-150">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-5/50 border-b border-gray-100">
              <th className="px-8 py-6 text-left text-[10px] font-black text-gray-3 uppercase tracking-[0.2em]">Tender ID</th>
              <th className="px-8 py-6 text-left text-[10px] font-black text-gray-3 uppercase tracking-[0.2em]">Issuing Entity</th>
              <th className="px-8 py-6 text-left text-[10px] font-black text-gray-3 uppercase tracking-[0.2em]">Category</th>
              <th className="px-8 py-6 text-left text-[10px] font-black text-gray-3 uppercase tracking-[0.2em]">Tender Title</th>
              <th className="px-8 py-6 text-left text-[10px] font-black text-gray-3 uppercase tracking-[0.2em]">Closing Date</th>
              <th className="px-8 py-6 text-left text-[10px] font-black text-gray-3 uppercase tracking-[0.2em]">Est. Value</th>
              <th className="px-8 py-6 text-right text-[10px] font-black text-gray-3 uppercase tracking-[0.2em]">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-5">
            {data.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <p className="text-gray-3 font-bold">No tenders found matching your criteria.</p>
                    <button className="text-primary font-black text-xs uppercase tracking-widest hover:underline">Clear all filters</button>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((tender) => (
                <tr
                  key={tender.id}
                  onClick={() => router.push(`/tenders/${tender.id || tender.tenderId}`)}
                  className="group cursor-pointer transition-all duration-300 hover:bg-primary/[0.02]"
                >
                  {/* Tender ID = tenderNumber (Reference Number) */}
                  <td className="px-8 py-6">
                    <span className="font-black text-primary tracking-tight group-hover:underline">
                      {tender.tenderNumber || tender.id || tender.tenderId}
                    </span>
                  </td>

                  {/* Issuing Entity = departmentName (leave blank if not available) */}
                  <td className="px-8 py-6">
                    <p className="text-black-2 font-bold leading-snug">{tender.departmentName || ""}</p>
                  </td>

                  {/* Category = procurementType */}
                  <td className="px-8 py-6">
                    <span className="text-xs font-bold text-gray-2 bg-gray-5 px-2 py-1 rounded-md">
                      {tender.procurementType ? tender.procurementType.replace(/_/g, " ") : "General"}
                    </span>
                  </td>

                  {/* Tender Title */}
                  <td className="px-8 py-6">
                    <p className="text-black-2 font-black leading-snug group-hover:text-primary transition-colors line-clamp-2 max-w-xs">{tender.title}</p>
                  </td>

                  {/* Closing Date = closingDate (Bid Submission Deadline) */}
                  <td className="px-8 py-6">
                    <p className="text-gray-2 font-bold whitespace-nowrap">{formatDate(tender.closingDate)}</p>
                  </td>

                  {/* Est. Value = estimatedBudget */}
                  <td className="px-8 py-6">
                    <p className="text-black-1 font-black whitespace-nowrap">{formatCurrency(tender.estimatedBudget)}</p>
                  </td>

                  {/* Status */}
                  <td className="px-8 py-6 text-right">
                    <StatusBadge status={tender.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
