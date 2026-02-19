"use client";

import { useRouter } from "next/navigation";
import StatusBadge from "./StatusBadge";



interface Props {
  data: any[];
}

export default function TenderTable({ data }: Props) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-xl shadow border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
          <tr>
            <th className="px-6 py-4 text-left">Tender ID</th>
            <th className="px-6 py-4 text-left">Issuing Entity</th>
            <th className="px-6 py-4 text-left">Category</th>
            <th className="px-6 py-4 text-left">Tender Title</th>
            <th className="px-6 py-4 text-left">Closing Date</th>
            <th className="px-6 py-4 text-left">Est. Value</th>
            <th className="px-6 py-4 text-left">Status</th>
          </tr>
        </thead>

        <tbody>
          {data.map((tender) => (
            <tr
              key={tender.id}
              onClick={() => router.push(`/tenders/${tender.id}`)}
              className="border-t cursor-pointer transition-all duration-200 hover:bg-[#953002]/5 hover:scale-[1.005]"
            >
              <td className="px-6 py-4 font-semibold text-[#953002]">
                {tender.id}
              </td>
              <td className="px-6 py-4">{tender.entity}</td>
              <td className="px-6 py-4">{tender.category}</td>
              <td className="px-6 py-4">{tender.title}</td>
              <td className="px-6 py-4">{tender.closing}</td>
              <td className="px-6 py-4 font-medium">{tender.value}</td>
              <td className="px-6 py-4">
                <StatusBadge status={tender.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
