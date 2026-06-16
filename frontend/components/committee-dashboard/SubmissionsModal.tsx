"use client";

import { X, FileText, Download, PieChart, Clock, ExternalLink, Lock } from "lucide-react";
import { AssignedTender } from "@/lib/types/evaluation.types";
import { useRouter } from "next/navigation";

interface SubmissionsModalProps {
  tender: AssignedTender | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function SubmissionsModal({ tender, isOpen, onClose }: SubmissionsModalProps) {
  const router = useRouter();
  if (!isOpen || !tender) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] transition-all animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-in zoom-in-95 duration-200 border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 pb-0">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-[#953002]/10 rounded-md">
              <FileText className="w-4 h-4 text-[#953002]" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Submission Overview</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 leading-snug uppercase tracking-tight">{tender.title}</h2>
          <p className="text-[#953002] text-xs font-bold mt-1 tracking-wider uppercase">{tender.reference}</p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <PieChart className="w-3.5 h-3.5 text-[#953002]" />
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Bids</p>
              </div>
              <p className="text-lg font-black text-gray-900">{tender.bidsCount}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-3.5 h-3.5 text-[#953002]" />
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</p>
              </div>
              <p className="text-sm font-black text-gray-900 uppercase">{tender.status}</p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-1">Quick Actions</p>
            <button className="w-full flex items-center justify-between p-3.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#953002]/10 rounded-lg group-hover:bg-[#953002]/20 transition-colors">
                  <Download className="w-4 h-4 text-[#953002]" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-900">Download All Files</p>
                  <p className="text-[10px] text-gray-400 font-medium">ZIP Archive of all submissions</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-300" />
            </button>

            {tender.status.toUpperCase() === "PENDING_OPENING" && (
              <button 
                onClick={() => router.push(`/tenders/${tender.reference}/bid-opening`)}
                className="w-full mt-2 flex items-center justify-center gap-2.5 p-4 bg-[#1A1D1F] text-white rounded-xl hover:bg-black transition-all shadow-lg shadow-black/20 group"
              >
                <Lock className="w-4 h-4 text-[#FFB401] group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-black uppercase tracking-widest">Proceed to Bid Opening</span>
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-gray-200 font-bold text-[11px] uppercase tracking-wider text-gray-500 hover:bg-gray-50 transition-all"
            >
              Close
            </button>
            <button 
              className="flex-[1.5] py-3 px-4 rounded-xl bg-[#953002] text-white font-bold text-[11px] uppercase tracking-wider shadow-md shadow-[#953002]/20 hover:bg-[#7a2702] transition-all"
              onClick={() => {
                alert("Navigating to Submission Details...");
                onClose();
              }}
            >
              View Full Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
