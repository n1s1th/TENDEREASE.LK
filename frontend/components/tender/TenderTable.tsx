"use client";

import { useRouter } from "next/navigation";
import StatusBadge from "./StatusBadge";



interface Props {
  data: any[];
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
                  <td className="px-8 py-6">
                    <span className="font-black text-primary tracking-tight group-hover:underline">
                      {tender.id || tender.tenderId}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-black-2 font-bold leading-snug">{tender.entity || "Ministry Office"}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xs font-bold text-gray-2 bg-gray-5 px-2 py-1 rounded-md">{tender.category || "General"}</span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-black-2 font-black leading-snug group-hover:text-primary transition-colors line-clamp-2 max-w-xs">{tender.title}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-gray-2 font-bold whitespace-nowrap">{tender.closing || tender.closingDate || "TBA"}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-black-1 font-black whitespace-nowrap">{tender.value || tender.estimatedBudget || "---"}</p>
                  </td>
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
