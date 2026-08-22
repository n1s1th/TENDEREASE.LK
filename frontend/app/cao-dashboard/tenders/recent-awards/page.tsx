"use client";

import { useEffect, useState } from "react";
import { useCAODashboardStore } from "@/store/cao-dashboard/cao-dashboard.store";
import TenderTable from "@/components/cao-dashboard/TenderTable";
import Pagination from "@/components/cao-dashboard/Pagination";
import type { Column } from "@/components/cao-dashboard/TenderTable";
import type { DashboardTender } from "@/lib/types/cao-dashboard.types";
import { X, Mail, Loader2 } from "lucide-react";

// Modal Component for showing Tender & Winner details
function AwardDetailsModal({ tender, onClose }: { tender: DashboardTender; onClose: () => void }) {
  const [winner, setWinner] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWinner() {
      try {
        const res = await fetch(`http://localhost:8084/api/v1/evaluations/mock/awards/tenders/${tender.id}/bidders`.replace('/v1/evaluations', '/evaluations'));
        if (res.ok) {
          const bidders = await res.json();
          const win = bidders.find((b: any) => b.status === 'WINNER');
          setWinner(win);
        }
      } catch (err) {
        console.error("Failed to fetch winner details", err);
      } finally {
        setLoading(false);
      }
    }
    fetchWinner();
  }, [tender.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              Award Details
            </h2>
            <p className="text-sm text-gray-500 mt-1">{tender.tenderNumber || tender.id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-8">
          {/* Tender Info Section */}
          <section>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
              Tender Information
            </h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
              <div>
                <span className="block text-xs font-semibold text-gray-500 mb-1">Title</span>
                <span className="text-sm font-medium text-gray-900">{tender.title}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-gray-500 mb-1">Department</span>
                <span className="text-sm font-medium text-gray-900">{tender.department || (tender as any).departmentName || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-gray-500 mb-1">Type</span>
                <span className="text-sm font-medium text-gray-900 inline-flex items-center gap-1.5">
                  {tender.procurementType || tender.type || 'N/A'}
                </span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-gray-500 mb-1">Estimated Budget</span>
                <span className="text-sm font-medium text-gray-900 inline-flex items-center gap-1.5">
                  {tender.estimatedBudget ? `Rs. ${tender.estimatedBudget.toLocaleString()}` : 'N/A'}
                </span>
              </div>
            </div>
          </section>

          {/* Winner Info Section */}
          <section>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
              Awarded To
            </h3>
            
            {loading ? (
              <div className="py-8 flex flex-col items-center justify-center text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin mb-2 text-[#953002]" />
                <span className="text-sm font-medium">Fetching winner details...</span>
              </div>
            ) : winner ? (
              <div className="bg-gradient-to-br from-[#fff5f2] to-[#ffefea] rounded-xl p-5 border border-[#953002]/10">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white rounded-lg shadow-sm border border-[#953002]/20 flex items-center justify-center text-xl font-bold text-[#953002]">
                    {winner.bidderName?.charAt(0) || 'B'}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-900">{winner.bidderName}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <Mail className="w-3.5 h-3.5" />
                      {winner.bidderEmail || 'No email provided'}
                    </div>
                  </div>
                  <div className="text-right bg-white px-4 py-2 rounded-lg shadow-sm border border-[#953002]/20">
                    <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Final Bid Amount</span>
                    <span className="text-base font-bold text-[#953002]">
                      {winner.bidAmount ? `Rs. ${winner.bidAmount.toLocaleString()}` : 'Rs. N/A'}
                    </span>
                  </div>
                </div>
                
                <div className="mt-5 grid grid-cols-2 gap-4 border-t border-[#953002]/10 pt-4">
                  <div>
                    <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Evaluation Score</span>
                    <div className="flex items-end gap-2">
                      <span className="text-xl font-black text-gray-900 leading-none">{winner.score || 'N/A'}</span>
                      <span className="text-xs font-semibold text-gray-500 mb-0.5">/ 100</span>
                    </div>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Bid Reference</span>
                    <span className="text-sm font-medium text-gray-800">{winner.bidderId}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-8 text-center">
                <p className="text-sm text-gray-500 font-medium">Winner details are not available or no winner was selected.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

// Component to fetch and display winner name in table cell
function WinnerCell({ tenderId }: { tenderId: string }) {
  const [name, setName] = useState<string>("...");
  
  useEffect(() => {
    async function fetchName() {
      try {
        const res = await fetch(`http://localhost:8084/api/evaluations/mock/awards/tenders/${tenderId}/bidders`);
        if (res.ok) {
          const bidders = await res.json();
          const win = bidders.find((b: any) => b.status === 'WINNER');
          if (win) setName(win.bidderName);
          else setName("-");
        } else setName("-");
      } catch {
        setName("-");
      }
    }
    fetchName();
  }, [tenderId]);

  return <span className="text-sm font-medium text-gray-900">{name}</span>;
}

const columns: Column<DashboardTender>[] = [
  {
    key: "tenderNumber" as any,
    label: "Reference No.",
    sortable: true,
    render: (row) => (
      <span style={{ fontWeight: 500, color: "var(--te-gray-1)" }}>{row.tenderNumber || row.id}</span>
    ),
  },
  { key: "title", label: "Tender Title" },
  {
    key: "procurementType",
    label: "Type",
    render: (row: any) => row.procurementType || row.type || "N/A",
  },
  {
    key: "department",
    label: "Department",
    render: (row: any) => row.department || row.departmentName || "N/A",
  },
  {
    key: "winningBidder" as any,
    label: "Winning Bidder",
    render: (row: any) => <WinnerCell tenderId={row.id} />,
  },
  {
    key: "status",
    label: "Status",
    render: () => (
      <span className="dash-table-status dash-table-status--completed bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full text-xs">
        AWARDED
      </span>
    ),
  },
];

export default function RecentAwardsPage() {
  const tenders = useCAODashboardStore((s) => s.tenders);
  const pagination = useCAODashboardStore((s) => s.pagination);
  const fetchTenders = useCAODashboardStore((s) => s.fetchTenders);
  const setActiveTab = useCAODashboardStore((s) => s.setActiveTab);
  const setPage = useCAODashboardStore((s) => s.setPage);
  const department = useCAODashboardStore((s) => s.department);
  const searchQuery = useCAODashboardStore((s) => s.searchQuery);

  const [selectedTender, setSelectedTender] = useState<DashboardTender | null>(null);

  useEffect(() => {
    setActiveTab("recent-awards");
    fetchTenders();
  }, [setActiveTab, fetchTenders, department]);

  const handleRowClick = (row: DashboardTender) => {
    setSelectedTender(row);
  };

  const filteredTenders = tenders.filter((tender: any) => {
    if (department) {
      const deptLower = department.toLowerCase().trim();
      const tenderDept = (tender.department || tender.departmentName || tender.agency || "").toLowerCase().trim();
      if (!tenderDept.includes(deptLower)) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const num = (tender.tenderNumber || tender.id || "").toLowerCase();
      const title = (tender.title || "").toLowerCase();
      if (!num.includes(q) && !title.includes(q)) return false;
    }
    return true;
  });

  return (
    <>
      <TenderTable
        columns={columns}
        data={filteredTenders}
        onRowAction={handleRowClick}
        emptyMessage="No recently awarded tenders found."
      />
      <Pagination
        pagination={pagination}
        onPageChange={(page) => {
          setPage(page);
          fetchTenders();
        }}
      />
      {selectedTender && (
        <AwardDetailsModal 
          tender={selectedTender} 
          onClose={() => setSelectedTender(null)} 
        />
      )}
    </>
  );
}
