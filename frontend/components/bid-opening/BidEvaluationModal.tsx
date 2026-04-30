"use client";

import React from "react";
import { X, ShieldCheck, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

interface BidEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bid: any;
  onUpdate: (bidId: string, updates: any) => void;
}

export default function BidEvaluationModal({ isOpen, onClose, bid, onUpdate }: BidEvaluationModalProps) {
  if (!isOpen || !bid) return null;

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

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] w-full max-w-[480px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
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

          {/* Checklist */}
          <div>
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">ADMINISTRATIVE CHECKLIST</h4>
            <div className="space-y-2">
              {checklist.map((item, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-center justify-between px-4 py-2.5 rounded-[16px] border transition-all ${
                    item.highlight ? 'bg-[#FFFBF0] border-[#FFB401]/20' : 'bg-[#F9FAFB] border-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center shadow-sm">
                      {item.icon}
                    </div>
                    <span className="text-[12px] font-bold text-gray-700">{item.label}</span>
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${
                    item.highlight ? 'text-[#FFB401]' : 'text-[#10B981]'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
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
            onClick={handleToggleCompliance}
            className={`flex-[1.2] px-6 py-3 rounded-[16px] font-black text-[11px] tracking-widest uppercase transition-all flex items-center justify-center gap-2 border border-[#953002]/10 ${
              isCompliant 
                ? 'bg-[#953002] text-white shadow-lg shadow-[#953002]/20' 
                : 'bg-[#953002]/5 text-[#953002] hover:bg-[#953002]/10'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            {isCompliant ? "UNDO COMPLIANCE" : "MARK AS COMPLIANT"}
          </button>
        </div>
      </div>
    </div>
  );
}
