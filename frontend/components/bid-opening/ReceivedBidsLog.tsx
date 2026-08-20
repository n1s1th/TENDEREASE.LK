"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, FileText, ChevronRight, Lock, AlertTriangle, ClipboardList, Copy, Check } from "lucide-react";
import { useOpeningStore } from "@/store/opening/opening.store";
import { useEvaluationStore } from "@/store/evaluation/evaluation.store";
import BidEvaluationModal from "./BidEvaluationModal";
import { useAuthStore } from "@/store";
import { getBidsByTender, evaluateBid } from "@/services/bid.service";

export default function ReceivedBidsLog() {
  const { user } = useAuthStore();
  const { session } = useOpeningStore();
  const { fetchEvaluationsByTender, toggleFlag, updateComplianceStatus } = useEvaluationStore();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const isActive = session?.status === 'OPEN';
  const isClosed = session?.status === 'CLOSED';
  const isUnlocked = isActive || isClosed;

  const [bids, setBids] = useState<any[]>([]);

   const [selectedBid, setSelectedBid] = useState<any>(null);
  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyId = (tenderId: string, tenderNo: string) => {
    const textToCopy = tenderNo || tenderId;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(tenderId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    const loadBids = async () => {
      if (!session?.tenderId) return;
      
      // Bids should only be fetched and displayed after the bid opening session is opened or concluded (OPEN or CLOSED)
      if (session.status !== 'OPEN' && session.status !== 'CLOSED') {
        setBids([]);
        return;
      }

      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8084";
        let mockEvaluations: any[] = [];
        try {
          const mockRes = await fetch(`${baseUrl}/api/evaluations/mock/${session.tenderId}/data?t=${Date.now()}`);
          if (mockRes.ok) {
            const mockJson = await mockRes.json();
            if (mockJson.data && mockJson.data.bidders) {
              mockEvaluations = mockJson.data.bidders;
            }
          }
        } catch (mockErr) {
          console.warn("Failed to fetch mock evaluations for lock check:", mockErr);
        }

        const data = await getBidsByTender(session.tenderId);
        let mapped: any[] = [];
        if (data) {
          mapped = data.map((bid: any, idx: number) => {
            let docsCount = 0;
            if (bid.bidData) {
              if (bid.bidData.cvsFile) docsCount++;
              if (bid.bidData.pca3File) docsCount++;
              if (bid.bidData.ganttChartFile) docsCount++;
              if (bid.bidData.methodologyFile) docsCount++;
              if (bid.bidData.pastExperienceFile) docsCount++;
              const bidSec = bid.bidData.bidSecurity;
              if (bidSec && (bidSec.fileUrl || bidSec.file)) docsCount++;
            }
            if (docsCount === 0) docsCount = 1; // Fallback to Technical Proposal.pdf

            const evalState = mockEvaluations.find((b: any) =>
              b.bidderId === bid.id ||
              b.bidderId?.toLowerCase() === bid.id?.toLowerCase() ||
              b.bidderId === String(bid.id) ||
              (b.bidderName && bid.companyName && b.bidderName.toLowerCase() === bid.companyName.toLowerCase()) ||
              (b.bidderName && bid.bidderName && b.bidderName.toLowerCase() === bid.bidderName.toLowerCase())
            );

            const isBeingEvaluatedByOther = !!(evalState && 
              evalState.status === "In Progress" && 
              evalState.evaluatorName && 
              evalState.evaluatorName !== user?.name);

            return {
              id: bid.id,
              no: (idx + 1).toString(),
              ref: bid.id.substring(0, 8).toUpperCase(),
              name: bid.companyName || bid.bidderName,
              time: bid.submittedAt || "TBA",
              docs: `${docsCount} Files`,
              amount: `${bid.currency} ${Number(bid.bidAmount || 0).toLocaleString()}`,
              status: bid.status === "FLAGGED" ? "SUBMITTED" : bid.status,
              isFlagged: bid.status === "FLAGGED",
              bidData: bid.bidData,
              technicalScore: bid.technicalScore,
              financialScore: bid.financialScore,
              notes: bid.notes,
              isBeingEvaluatedByOther,
              evaluatorName: evalState?.evaluatorName || ""
            };
          });
        }

        try {
          const evaluations = await fetchEvaluationsByTender(session.tenderId);
          if (evaluations && evaluations.length > 0) {
            mapped = mapped.map(bid => {
              const evalItem = evaluations.find((e: any) => e.id === bid.id || e.bidId === bid.id);
              if (evalItem) {
                return { 
                  ...bid, 
                  isFlagged: evalItem.isFlagged, 
                  status: evalItem.complianceStatus === 'PENDING' ? 'VERIFIED' : evalItem.complianceStatus 
                };
              }
              return bid;
            });
          }
        } catch (storeErr) {
          console.warn("Evaluations store sync warning:", storeErr);
        }

        setBids(mapped);
      } catch (err) {
        console.error("Failed to load bids:", err);
      }
    };
    
    loadBids();

    let interval: NodeJS.Timeout | null = null;
    if (session?.status === 'OPEN') {
      interval = setInterval(() => {
        loadBids();
      }, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [session?.tenderId, session?.status, fetchEvaluationsByTender]);

  const handleUpdateBid = async (no: string, updates: any) => {
    const bidToUpdate = bids.find(b => b.no === no);
    if (!bidToUpdate) return;

    try {
      if (updates.hasOwnProperty('isFlagged')) {
        // 1. Update the status in bid-service (primary persistence during Bid Opening)
        const newStatus = updates.isFlagged ? "FLAGGED" : "SUBMITTED";
        await evaluateBid(bidToUpdate.id, { status: newStatus });

        // 2. Try updating in evaluation-service as well
        try {
          await toggleFlag(bidToUpdate.id);
        } catch (e) {
          console.warn("Evaluation record not yet created/updated for flagging:", e);
        }
      }
      if (updates.hasOwnProperty('status')) {
        // 1. Update the status in bid-service
        await evaluateBid(bidToUpdate.id, { status: updates.status });

        // 2. Try updating in evaluation-service
        try {
          await updateComplianceStatus(bidToUpdate.id, updates.status);
        } catch (e) {
          console.warn("Evaluation record not yet created/updated for compliance status:", e);
        }
      }

      setBids(prev => {
        const newBids = prev.map(b => b.no === no ? { ...b, ...updates } : b);
        const updatedBid = newBids.find(b => b.no === no);
        if (selectedBid?.no === no && updatedBid) {
          setSelectedBid(updatedBid);
        }
        return newBids;
      });
    } catch (err) {
      console.error("Failed to persist update:", err);
    }
  };

  const totalPages = Math.ceil(bids.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleBids = bids.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="mt-4 mb-8 bg-white rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">

      <div className="p-6 border-b border-gray-50 flex justify-between items-start relative z-10 bg-white">
        <div>
          <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3 uppercase">
            RECEIVED BIDS LOG
          </h3>
          <p className="text-xs font-bold text-gray-400 mt-2.5 uppercase tracking-widest">SECURE ADMINISTRATIVE LOG OF ALL VERIFIED TENDER SUBMISSIONS.</p>
        </div>
        <span className="bg-gray-100 text-gray-500 text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest">
          {bids.length} TOTAL SUBMISSIONS
        </span>
      </div>

      <div className="overflow-x-auto min-h-[120px]">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="bg-[#9A3B12] text-white text-[13px] font-black uppercase tracking-wider">
              <th className="py-4 px-6 rounded-tl-lg text-center">NO</th>
              <th className="py-4 px-4 text-center">BID REF.</th>
              <th className="py-4 px-4 text-center">BIDDER NAME</th>
              <th className="py-4 px-4 text-center">SUBMITTED AT</th>
              <th className="py-4 px-4 text-center">DOCS</th>
              <th className="py-4 px-4 text-center">AMOUNT</th>
              <th className="py-4 px-4 text-center">STATUS</th>
              <th className="py-4 px-4 text-center rounded-tr-lg">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {visibleBids.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-gray-500 font-bold italic">
                  {isUnlocked ? "No submissions logged for this session..." : "Submitted bids are hidden until opening session unlocked"}
                </td>
              </tr>
            ) : visibleBids.map((row, idx) => (
              <tr key={row.no} className={`border-b border-gray-100 hover:bg-gray-50/80 transition-all ${idx % 2 === 0 ? 'bg-white' : 'bg-[#F2F4F7]'} ${row.isFlagged ? 'bg-red-50/30' : ''}`}>
                <td className="py-4 px-6 text-center">
                  <div className="font-bold text-xs text-gray-400">{row.no}</div>
                </td>
                <td className="py-4 px-4 text-center">
                  <div className="font-bold text-sm text-gray-900">{row.ref}</div>
                </td>
                <td className="py-4 px-4 text-center">
                  <div className="font-bold text-sm text-gray-800 tracking-tight">{row.name}</div>
                </td>
                <td className="py-4 px-4 text-center">
                  <div className="text-sm font-bold text-gray-600">{row.time}</div>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="text-[13px] font-black text-gray-500 tracking-tighter uppercase">
                    {row.docs}
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <div className="text-sm font-black text-[#9A3B12] tabular-nums">{row.amount}</div>
                </td>
                <td className="py-4 px-4 text-center relative">
                  <div className="relative flex items-center justify-center">
                    {row.isFlagged && (
                      <svg 
                        viewBox="0 0 24 24" 
                        className="w-3.5 h-3.5 text-red-500 fill-red-500 absolute translate-x-16 shrink-0"
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <line x1="4" y1="22" x2="4" y2="2" />
                        <path d="M4 2h15l-6 5l6 5H4z" />
                      </svg>
                    )}
                    <span className={`text-[11.5px] font-black px-2.5 py-0.5 rounded-md border uppercase tracking-widest ${
                      row.status === "COMPLIANT" 
                        ? "bg-green-50 text-green-600 border-green-200" 
                        : row.status?.toUpperCase() === "SUBMITTED"
                          ? "bg-[#FFF7ED] text-[#953002] border-[#953002]/20"
                          : "bg-gray-50 text-gray-600 border-gray-200"
                    }`}>
                      {row.status}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button 
                      onClick={() => {
                        setSelectedBid(row);
                        setIsEvalModalOpen(true);
                      }}
                      className={`p-2 rounded-xl transition-all relative group/eye cursor-pointer ${
                        row.isBeingEvaluatedByOther 
                          ? "text-amber-500 hover:bg-amber-50"
                          : "text-gray-400 hover:text-[#9A3B12] hover:bg-orange-50"
                      }`}
                    >
                      <ClipboardList className="w-5 h-5" />
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[10px] font-bold rounded opacity-0 group-hover/eye:opacity-100 pointer-events-none transition-all duration-200 shadow-lg whitespace-nowrap z-[110] after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-gray-900">
                        {row.isBeingEvaluatedByOther ? `Already being evaluated by ${row.evaluatorName}` : "Evaluate Bids"}
                      </span>
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyId(row.id, row.ref);
                      }}
                      className={`p-2 rounded-xl transition-all relative group/copy cursor-pointer ${
                        copiedId === row.id 
                          ? "bg-green-50 text-green-600" 
                          : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      }`}
                    >
                      {copiedId === row.id ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[10px] font-bold rounded opacity-0 group-hover/copy:opacity-100 pointer-events-none transition-all duration-200 shadow-lg whitespace-nowrap z-[110] after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-gray-900">
                        {copiedId === row.id ? "Copied!" : "Copy ID"}
                      </span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-gray-50 flex justify-between items-center bg-white/50 relative z-10">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          SHOWING {visibleBids.length} OF {bids.length} ENTRIES
        </span>
        <div className="flex items-center gap-1.5">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-[#953002]/5 hover:text-[#953002] hover:border-[#953002]/30 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-500 disabled:hover:border-gray-200"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button 
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-9 h-9 rounded-lg flex items-center justify-center text-[13px] font-black transition-all cursor-pointer ${
                currentPage === page 
                  ? 'bg-[#953002] text-white shadow-md shadow-[#953002]/20 border border-[#953002]' 
                  : 'border border-gray-200 text-gray-500 hover:bg-[#953002]/5 hover:text-[#953002] hover:border-[#953002]/30'
              }`}
            >
              {page}
            </button>
          ))}

          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-[#953002]/5 hover:text-[#953002] hover:border-[#953002]/30 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-500 disabled:hover:border-gray-200"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <BidEvaluationModal 
        isOpen={isEvalModalOpen}
        onClose={() => setIsEvalModalOpen(false)}
        bid={selectedBid}
        onUpdate={handleUpdateBid}
      />
    </div>
  );
}
