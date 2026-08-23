"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, ShieldCheck, AlertTriangle } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { getTenderById } from "@/services/tender.service";

interface BidEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bid: any;
  onUpdate: (bidId: string, updates: any) => void;
}

export default function BidEvaluationModal({ isOpen, onClose, bid, onUpdate }: BidEvaluationModalProps) {
  const [mounted, setMounted] = useState(false);
  const [resolvedTenderNo, setResolvedTenderNo] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && tenderId) {
      getTenderById(tenderId)
        .then((res) => {
          if (res && res.tenderNumber) {
            setResolvedTenderNo(res.tenderNumber);
          }
        })
        .catch((err) => {
          console.error("Failed to resolve tender Number in modal:", err);
        });
    }
  }, [isOpen, tenderId]);

  if (!isOpen || !bid) return null;
  if (!mounted) return null;

  const isCompliant = bid.status === "COMPLIANT";

  const handleToggleFlag = () => {
    onUpdate(bid.no, { isFlagged: !bid.isFlagged });
  };

  const handleToggleCompliance = () => {
    if (isCompliant) {
      onUpdate(bid.no, { status: "VERIFIED" });
    } else {
      onUpdate(bid.no, { status: "COMPLIANT" });
    }
  };

  const checklist = [
    { label: "Valid Bid Bond (Original)", status: "VERIFIED", icon: <CheckCircle2 className="w-4 h-4 text-[#10B981]" /> },
    { label: "Articles of Association", status: "VERIFIED", icon: <CheckCircle2 className="w-4 h-4 text-[#10B981]" /> },
    { label: "BOQ / Financial Schedule", status: "PENDING", icon: <AlertTriangle className="w-4 h-4 text-[#FFB401]" />, highlight: true },
    { label: "VAT Registration Proof", status: "VERIFIED", icon: <CheckCircle2 className="w-4 h-4 text-[#10B981]" /> },
  ];

  return createPortal(
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] w-full max-w-[410px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-start bg-white">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#953002]" />
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">TECHNICAL VETTING WORKSPACE</span>
            </div>
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
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">BIDDER CAPACITY</span>
              <span className="text-[13px] font-black text-gray-900 leading-tight block">{bid.name}</span>
            </div>
            <div className="bg-[#FFF9F7] rounded-[20px] p-3.5 border border-[#953002]/10">
              <span className="text-[9px] font-black text-[#953002]/60 uppercase tracking-widest block mb-1">QUOTED TOTAL</span>
              <span className="text-[15px] font-black text-[#953002]">{bid.amount}</span>
            </div>
          </div>

          {/* Already Evaluating Warning Box */}
          {bid.isBeingEvaluatedByOther && (
            <div className="bg-red-50 border border-red-200 rounded-[20px] p-4 flex gap-3 items-start animate-in fade-in duration-200">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-black text-red-800 uppercase tracking-wider mb-1">
                  UNDER EVALUATION
                </h4>
                <p className="text-[11px] font-bold text-red-700 leading-relaxed">
                  This bid is already being evaluated by another officer ({bid.evaluatorName}).
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white border-t border-gray-100 flex gap-3">
          <button
            onClick={handleToggleFlag}
            className={`flex-1 py-3 rounded-[16px] font-black text-[11px] tracking-widest uppercase transition-all flex items-center justify-center gap-2 border border-[#953002]/10 ${bid.isFlagged ? 'bg-[#953002] text-white shadow-lg shadow-[#953002]/20' : 'bg-[#953002]/5 text-[#953002] hover:bg-[#953002]/10'
              }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            {bid.isFlagged ? "UNFLAG" : "FLAG"}
          </button>
          <button
            disabled={bid.isBeingEvaluatedByOther}
            onClick={() => router.push(`/tenders/${tenderId}/bid-evaluation?bidId=${bid.id}`)}
            className={`flex-[1.2] px-6 py-3 rounded-[16px] font-black text-[11px] tracking-widest uppercase transition-all flex items-center justify-center gap-2 border ${bid.isBeingEvaluatedByOther
                ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-60"
                : "border-transparent bg-[#953002] text-white hover:bg-[#802801] shadow-lg shadow-[#953002]/20"
              }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            {bid.isBeingEvaluatedByOther ? "LOCKED" : "EVALUATE BID"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
