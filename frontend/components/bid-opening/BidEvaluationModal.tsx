"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, ShieldCheck, AlertTriangle } from "lucide-react";
import { useRouter, useParams } from "next/navigation";

interface BidEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bid: any;
  onUpdate: (bidId: string, updates: any) => void;
}

export default function BidEvaluationModal({ isOpen, onClose, bid, onUpdate }: BidEvaluationModalProps) {
  const router = useRouter();
  const params = useParams();
  const tenderId = params?.id as string;

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !bid) return null;
  if (!mounted) return null;

  const handleToggleFlag = () => {
    onUpdate(bid.no, { isFlagged: !bid.isFlagged });
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] w-full max-w-[480px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-[#953002] shrink-0" />
            <h3 className="text-xl font-black text-gray-900 tracking-tight">BID REVIEW: {bid.ref}</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-5">
          {/* Bidder Info Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#F8F9FA] rounded-[20px] p-3.5 border border-gray-100">
              <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-1">BIDDER NAME</span>
              <span className="text-[15px] font-black text-gray-900 leading-tight block">{bid.name}</span>
            </div>
            <div className="bg-[#FFF9F7] rounded-[20px] p-3.5 border border-[#953002]/10">
              <span className="text-[9px] font-black text-[#953002]/60 uppercase tracking-widest block mb-1">QUOTED TOTAL</span>
              <span className="text-[15px] font-black text-[#953002]">{bid.amount}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white border-t border-gray-100 flex gap-3">
          <button 
            onClick={handleToggleFlag}
            className={`flex-1 py-3 rounded-[16px] font-black text-[11px] tracking-widest uppercase transition-all flex items-center justify-center gap-2 border border-[#953002]/10 ${
              bid.isFlagged ? 'bg-[#953002] text-white shadow-lg shadow-[#953002]/20' : 'bg-[#953002]/5 text-[#953002] hover:bg-[#953002]/10'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            {bid.isFlagged ? "UNFLAG BID" : "FLAG SUBMISSION"}
          </button>
          <button 
            onClick={() => router.push(`/tenders/${tenderId}/bid-evaluation`)}
            className="flex-[1.2] px-6 py-3 rounded-[16px] font-black text-[11px] tracking-widest uppercase transition-all flex items-center justify-center gap-2 border border-transparent bg-[#953002] text-white hover:bg-[#802801] shadow-lg shadow-[#953002]/20"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            EVALUATE BID
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
