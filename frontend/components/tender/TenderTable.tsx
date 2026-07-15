"use client";

import { useRouter } from "next/navigation";
import StatusBadge from "./StatusBadge";

interface Props {
  data: any[];
}

function ClosingDate({ value, closing }: { value?: string; closing?: string }) {
  if (!value && !closing) return <span className="text-gray-3 font-medium">TBA</span>;

  if (value) {
    const date = new Date(value);
    const now = new Date();
    const daysLeft = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
      return <span className="font-semibold text-gray-3 whitespace-nowrap line-through">{date.toLocaleDateString()}</span>;
    }
    if (daysLeft <= 3) {
      return (
        <span className="font-bold text-error whitespace-nowrap">
          {date.toLocaleDateString()}
          <span className="ml-1.5 text-[10px] font-semibold bg-error/10 text-error px-1.5 py-0.5 rounded-full">
            {daysLeft === 0 ? "Today" : `${daysLeft}d left`}
          </span>
        </span>
      );
    }
    if (daysLeft <= 7) {
      return (
        <span className="font-semibold text-warning whitespace-nowrap">
          {date.toLocaleDateString()}
          <span className="ml-1.5 text-[10px] font-semibold bg-warning/10 text-warning px-1.5 py-0.5 rounded-full">
            {daysLeft}d left
          </span>
        </span>
      );
    }
    return <span className="font-normal text-gray-2 whitespace-nowrap">{date.toLocaleDateString()}</span>;
  }

  return <span className="font-normal text-gray-2 whitespace-nowrap">{closing}</span>;
}

export default function TenderTable({ data }: Props) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-[2rem] shadow-premium border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-700 delay-150">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse font-sans">
          <thead>
            <tr className="bg-gray-5/50 border-b border-gray-100">
              <th className="px-8 py-5 text-left text-[10px] font-semibold text-gray-3 uppercase tracking-[0.2em]">Tender ID</th>
              <th className="px-8 py-5 text-left text-[10px] font-semibold text-gray-3 uppercase tracking-[0.2em]">Issuing Entity</th>
              <th className="px-8 py-5 text-left text-[10px] font-semibold text-gray-3 uppercase tracking-[0.2em]">Category</th>
              <th className="px-8 py-5 text-left text-[10px] font-semibold text-gray-3 uppercase tracking-[0.2em]">Tender Title</th>
              <th className="px-8 py-5 text-left text-[10px] font-semibold text-gray-3 uppercase tracking-[0.2em]">Closing Date</th>
              <th className="px-8 py-5 text-left text-[10px] font-semibold text-gray-3 uppercase tracking-[0.2em]">Est. Value</th>
              <th className="px-8 py-5 text-right text-[10px] font-semibold text-gray-3 uppercase tracking-[0.2em]">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-5">
            {data.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <p className="text-gray-3 font-medium">No tenders found matching your criteria.</p>
                    <button className="text-primary font-semibold text-xs uppercase tracking-widest hover:underline">Clear all filters</button>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((tender) => (
                <tr
                  key={tender.id}
                  onClick={() => router.push(`/tenders/${tender.id || tender.tenderId || tender.tenderNumber}`)}
                  className="group cursor-pointer transition-all duration-300 hover:bg-primary/[0.02]"
                >
                  {/* Tender ID — primary identifier, bold + brand color */}
                  <td className="px-8 py-5">
                    <span className="font-bold text-primary text-[13px] tracking-tight group-hover:underline">
                      {tender.tenderNumber || tender.tenderId || tender.id}
                    </span>
                  </td>

                  {/* Issuing Entity — secondary info */}
                  <td className="px-8 py-5">
                    <p className="text-black-2 font-normal leading-snug text-[13px]">
                      {tender.departmentName || tender.entity || "Ministry Office"}
                    </p>
                  </td>

                  {/* Category — badge, de-emphasised */}
                  <td className="px-8 py-5">
                    <span className="text-[11px] font-medium text-gray-2 bg-gray-5 px-2.5 py-1 rounded-md whitespace-nowrap">
                      {tender.procurementType || tender.category || "General"}
                    </span>
                  </td>

                  {/* Tender Title — most important field, bold */}
                  <td className="px-8 py-5">
                    <p className="text-black-1 font-bold text-[13px] leading-snug group-hover:text-primary transition-colors line-clamp-2 max-w-xs">
                      {tender.title}
                    </p>
                  </td>

                  {/* Closing Date — highlighted when urgent */}
                  <td className="px-8 py-5">
                    <ClosingDate value={tender.closingDate} closing={tender.closing} />
                  </td>

                  {/* Est. Value — financial figure, bold */}
                  <td className="px-8 py-5">
                    <p className="text-black-1 font-bold text-[13px] whitespace-nowrap tabular-nums">
                      {tender.estimatedBudget
                        ? `LKR ${Number(tender.estimatedBudget).toLocaleString()}`
                        : (tender.value || <span className="text-gray-3 font-normal">—</span>)}
                    </p>
                  </td>

                  {/* Status badge */}
                  <td className="px-8 py-5 text-right">
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
