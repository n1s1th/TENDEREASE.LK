"use client";

import { useEffect, useState } from "react";
import { useCAODashboardStore } from "@/store/cao-dashboard/cao-dashboard.store";
import TenderTable from "@/components/cao-dashboard/TenderTable";
import Pagination from "@/components/cao-dashboard/Pagination";
import type { Column } from "@/components/cao-dashboard/TenderTable";
import type { DashboardTender } from "@/lib/types/cao-dashboard.types";
import { X, Mail, Loader2 } from "lucide-react";

// Modal Component for showing Tender & Winner details
// Sidebar Component for showing Tender & Winner details
function AwardDetailsSidebar({ tender, onClose }: { tender: DashboardTender; onClose: () => void }) {
  const [winner, setWinner] = useState<any>(null);
  const [winnerEvalDetails, setWinnerEvalDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const _rawUrl1 = process.env.NEXT_PUBLIC_EVALUATION_API_URL || process.env.NEXT_PUBLIC_API_URL || "https://api.tenderease.me"; const evalUrl = _rawUrl1.includes("/api/v1") ? _rawUrl1.replace("/api/v1", "") : _rawUrl1;
        
        // Fetch basic winner data (name, email, bidAmount, final score)
        const res = await fetch(`${evalUrl}/api/evaluations/mock/awards/tenders/${tender.id}/bidders`);
        let win = null;
        if (res.ok) {
          const bidders = await res.json();
          win = bidders.find((b: any) => b.status === 'WINNER');
          setWinner(win);
        }

        // Fetch detailed evaluation data to get tech/fin breakdown
        if (win) {
          const dataRes = await fetch(`${evalUrl}/api/evaluations/mock/${tender.id}/data`);
          if (dataRes.ok) {
            const dataJson = await dataRes.json();
            const bidderDetails = dataJson.data?.bidders?.find((b: any) => String(b.bidderId) === String(win.bidderId));
            if (bidderDetails) {
              setWinnerEvalDetails(bidderDetails);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch winner details", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [tender.id]);

  // Calculate technical and financial scores if we have the breakdown
  let techScore = 0;
  let finScore = 0;
  if (winnerEvalDetails) {
    const techCriteria = winnerEvalDetails.technicalCriteria || [];
    const finCriteria = winnerEvalDetails.financialCriteria || [];
    
    // Weightings: 70% tech, 30% fin
    const techRaw = techCriteria.reduce((sum: number, c: any) => sum + ((c.score || 0) * (c.weight || 0) / 100), 0);
    const finRaw = finCriteria.reduce((sum: number, c: any) => sum + ((c.score || 0) * (c.weight || 0) / 100), 0);
    
    techScore = parseFloat((techRaw * 0.7).toFixed(2));
    finScore = parseFloat((finRaw * 0.3).toFixed(2));
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-[550px] bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 bg-gray-50/50 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              Award Details
            </h2>
            <p className="text-sm text-gray-500 mt-1">{tender.tenderNumber || tender.id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-8">
          {/* Tender Info Section */}
          <section>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">
              Tender Information
            </h3>
            <div className="space-y-4">
              <div>
                <span className="block text-xs font-semibold text-gray-500 mb-1">Title</span>
                <span className="text-sm font-medium text-gray-900 leading-relaxed">{tender.title}</span>
              </div>
              <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                <div>
                  <span className="block text-xs font-semibold text-gray-500 mb-1">Department</span>
                  <span className="text-sm font-medium text-gray-900">{tender.department || (tender as any).departmentName || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-500 mb-1">Procurement Type</span>
                  <span className="text-sm font-medium text-gray-900">
                    {tender.procurementType || tender.type || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-500 mb-1">Bidding Method</span>
                  <span className="text-sm font-medium text-gray-900">
                    {((tender as any).biddingMethod || 'N/A').replace(/_/g, ' ')}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-500 mb-1">Ministry</span>
                  <span className="text-sm font-medium text-gray-900">
                    {(tender as any).ministryName || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-500 mb-1">Tender Type</span>
                  <span className="text-sm font-medium text-gray-900">
                    {((tender as any).tenderType || 'N/A').replace(/_/g, ' ')}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-500 mb-1">Estimated Budget</span>
                  <span className="text-sm font-medium text-gray-900">
                    {tender.estimatedBudget ? `Rs. ${tender.estimatedBudget.toLocaleString()}` : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-500 mb-1">Status</span>
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {(tender.status || 'UNKNOWN').toLowerCase()}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Winner Info Section */}
          <section>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">
              Awarded To
            </h3>
            
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin mb-3 text-emerald-600" />
                <span className="text-sm font-medium">Fetching winner details...</span>
              </div>
            ) : winner ? (
              <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-200 shadow-sm relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white rounded-lg shadow-sm border border-emerald-200 flex items-center justify-center text-xl font-bold text-emerald-700 shrink-0">
                      {winner.bidderName?.charAt(0) || 'B'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-bold text-gray-900 leading-tight mb-1">{winner.bidderName}</h4>
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Mail className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                        <span className="truncate">{winner.bidderEmail || 'No email provided'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-5 grid grid-cols-2 gap-y-5 gap-x-4">
                    <div className="col-span-2 bg-white rounded-lg p-3 border border-emerald-100 shadow-sm flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Final Bid Amount</span>
                      <span className="text-lg font-black text-emerald-700">
                        {winner.bidAmount ? `Rs. ${winner.bidAmount.toLocaleString()}` : 'Rs. N/A'}
                      </span>
                    </div>

                    <div>
                      <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Final Score</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xl font-black text-emerald-700">{winner.score || '0'}</span>
                        <span className="text-xs font-semibold text-gray-500">/ 100</span>
                      </div>
                    </div>
                    
                    <div>
                      <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Bid Reference</span>
                      <span className="text-xs font-medium text-gray-800 break-all">{winner.bidderId}</span>
                    </div>
                  </div>

                  {winnerEvalDetails && (
                    <div className="mt-5 pt-4 border-t border-emerald-200/60">
                      <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">Evaluation Breakdown</span>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-medium text-gray-700">Technical (70%)</span>
                            <span className="font-bold text-emerald-700">{techScore.toFixed(2)} pts</span>
                          </div>
                          <div className="w-full bg-emerald-200/50 rounded-full h-1.5">
                            <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${Math.min(100, (techScore / 70) * 100)}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-medium text-gray-700">Financial (30%)</span>
                            <span className="font-bold text-emerald-700">{finScore.toFixed(2)} pts</span>
                          </div>
                          <div className="w-full bg-emerald-200/50 rounded-full h-1.5">
                            <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${Math.min(100, (finScore / 30) * 100)}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {winnerEvalDetails?.evaluationNotes && (
                    <div className="mt-4 pt-4 border-t border-emerald-200/60">
                      <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Evaluation Notes</span>
                      <p className="text-xs text-gray-700 italic">"{winnerEvalDetails.evaluationNotes}"</p>
                    </div>
                  )}
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
    </>
  );
}


// Component to fetch and display winner name in table cell
function WinnerCell({ tenderId }: { tenderId: string }) {
  const [name, setName] = useState<string>("...");
  
  useEffect(() => {
    async function fetchName() {
      try {
        const _rawUrl2 = process.env.NEXT_PUBLIC_EVALUATION_API_URL || "http://localhost:8084"; const evalUrl = _rawUrl2.includes("/api/v1") ? _rawUrl2.replace("/api/v1", "") : _rawUrl2;
        const res = await fetch(`${evalUrl}/api/evaluations/mock/awards/tenders/${tenderId}/bidders`);
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
        <AwardDetailsSidebar 
          tender={selectedTender} 
          onClose={() => setSelectedTender(null)} 
        />
      )}
    </>
  );
}
