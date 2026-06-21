"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, FileText, ChevronRight, Lock, AlertTriangle } from "lucide-react";
import { useOpeningStore } from "@/store/opening/opening.store";
import { useEvaluationStore } from "@/store/evaluation/evaluation.store";
import BidEvaluationModal from "./BidEvaluationModal";

export default function ReceivedBidsLog() {
  const { session } = useOpeningStore();
  const { fetchEvaluationsByTender, toggleFlag, updateComplianceStatus } = useEvaluationStore();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const isActive = session?.status === 'OPEN';
  const isClosed = session?.status === 'CLOSED';

  const [bids, setBids] = useState<any[]>([]);

  const [selectedBid, setSelectedBid] = useState<any>(null);
  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);

  useEffect(() => {
    const syncBids = async () => {
      if (!session?.tenderId) return;
      try {
        const evaluations = await fetchEvaluationsByTender(session.tenderId);
        if (evaluations && evaluations.length > 0) {
          setBids(prev => prev.map(bid => {
            const evalItem = evaluations.find(e => e.id === bid.id || e.bidId === bid.id);
            if (evalItem) {
              return { 
                ...bid, 
                isFlagged: evalItem.isFlagged, 
                status: evalItem.complianceStatus === 'PENDING' ? 'VERIFIED' : evalItem.complianceStatus 
              };
            }
            return bid;
          }));
        }
      } catch (err) {
        console.error("Sync failed:", err);
      }
    };
    syncBids();
  }, [session?.tenderId, fetchEvaluationsByTender]);

  const handleUpdateBid = async (no: string, updates: any) => {
    const bidToUpdate = bids.find(b => b.no === no);
    if (!bidToUpdate) return;

    try {
      if (updates.hasOwnProperty('isFlagged')) {
        await toggleFlag(bidToUpdate.id);
      }
      if (updates.hasOwnProperty('status')) {
        await updateComplianceStatus(bidToUpdate.id, updates.status);
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
    <div className="mt-4 mb-8 bg-white rounded-[32px] border border-gray-100 p-6 shadow-sm relative overflow-hidden">

      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3 uppercase">
            RECEIVED BIDS LOG
            {isActive ? (
              <span className="bg-[#ECFDF5] text-[#10B981] text-[12px] font-black px-3 py-1 rounded-full border border-[#10B981]/20 flex items-center gap-1.5 uppercase tracking-widest">
                <ShieldCheck className="w-3.5 h-3.5" />
                SESSION ACTIVE
              </span>
            ) : isClosed ? (
              <span className="bg-gray-100 text-gray-500 text-[12px] font-black px-3 py-1 rounded-full border border-gray-200 flex items-center gap-1.5 uppercase tracking-widest">
                <ShieldCheck className="w-3.5 h-3.5" />
                SESSION CONCLUDED
              </span>
            ) : null}
          </h3>
          <p className="text-xs font-bold text-gray-400 mt-2.5 uppercase tracking-widest">SECURE ADMINISTRATIVE LOG OF ALL VERIFIED TENDER SUBMISSIONS.</p>
        </div>
        <span className="bg-gray-100 text-gray-500 text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest">
          {bids.length} TOTAL SUBMISSIONS
        </span>
      </div>

      <div className={`overflow-x-auto ${visibleBids.length === 0 ? 'min-h-[150px]' : 'min-h-[400px]'}`}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#9A3B12] text-white text-[13px] font-black uppercase tracking-wider">
              <th className="py-4 px-6 rounded-tl-lg">NO</th>
              <th className="py-4 px-4">BID REF.</th>
              <th className="py-4 px-4">BIDDER NAME</th>
              <th className="py-4 px-4 text-center">SUBMITTED AT</th>
              <th className="py-4 px-4 text-center">DOCS</th>
              <th className="py-4 px-4 text-center">AMOUNT</th>
              <th className="py-4 px-4 text-center">STATUS</th>
              <th className="py-4 px-4 text-center rounded-tr-lg">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {visibleBids.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-gray-500 font-bold italic">No submissions logged for this session...</td>
              </tr>
            ) : visibleBids.map((row, idx) => (
              <tr key={row.no} className={`border-b border-gray-100 hover:bg-gray-50/80 transition-all ${idx % 2 === 0 ? 'bg-white' : 'bg-[#F2F4F7]'} ${row.isFlagged ? 'bg-red-50/30' : ''}`}>
                <td className="py-4 px-6">
                  <div className="font-bold text-xs text-gray-400">{row.no}</div>
                </td>
                <td className="py-4 px-4">
                  <div className="font-bold text-sm text-gray-900">{row.ref}</div>
                </td>
                <td className="py-4 px-4">
                  <div className="font-bold text-sm text-gray-800 uppercase tracking-tight">{row.name}</div>
                </td>
                <td className="py-4 px-4 text-center">
                  <div className="text-sm font-bold text-gray-600">{row.time}</div>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block px-3 py-1 text-[10px] font-black text-gray-500 bg-gray-100 rounded-md border border-gray-200 tracking-tighter uppercase">
                    {row.docs}
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <div className="text-sm font-black text-[#9A3B12] tabular-nums">{row.amount}</div>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className={`text-[10px] font-black px-3 py-1 rounded-md border uppercase tracking-widest ${
                    row.status === "COMPLIANT" 
                      ? "bg-green-50 text-green-600 border-green-200" 
                      : row.isFlagged 
                        ? "bg-yellow-50 text-yellow-600 border-yellow-200"
                        : "bg-blue-50 text-blue-600 border-blue-200"
                  }`}>
                    {row.isFlagged ? "FLAGGED" : row.status}
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <button 
                    onClick={() => {
                      setSelectedBid(row);
                      setIsEvalModalOpen(true);
                    }}
                    className="bg-[#953002]/5 text-[#953002] border border-[#953002]/10 text-[10px] font-black tracking-widest px-5 py-2 rounded-full hover:bg-[#953002]/10 transition-all whitespace-nowrap uppercase flex items-center gap-2"
                  >
                    Evaluate Submission
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-6 relative z-10">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          SHOWING {visibleBids.length} OF {bids.length} ENTRIES
        </span>
        <div className="flex items-center gap-2">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-all disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button 
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-10 h-10 rounded-lg flex items-center justify-center text-[13px] font-black transition-all ${
                currentPage === page 
                  ? 'bg-[#953002] text-white shadow-lg shadow-[#953002]/20' 
                  : 'border border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}

          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-all disabled:opacity-30 disabled:hover:bg-transparent"
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
