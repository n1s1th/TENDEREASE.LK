"use client";

import { X, ClipboardCheck, Users, Calendar, AlertCircle } from "lucide-react";
import { AssignedTender } from "@/lib/types/evaluation.types";

interface EvaluationModalProps {
  tender: AssignedTender | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EvaluationModal({ tender, isOpen, onClose }: EvaluationModalProps) {
  if (!isOpen || !tender) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] transition-all animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-in zoom-in-95 duration-200 border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Cleaner White Design */}
        <div className="relative p-6 pb-0">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-[#9A3B12]/10 rounded-md">
              <ClipboardCheck className="w-4 h-4 text-[#9A3B12]" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Bid Evaluation Workspace</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 leading-snug uppercase tracking-tight">{tender.title}</h2>
          <p className="text-[#9A3B12] text-xs font-bold mt-1 tracking-wider uppercase">{tender.reference}</p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Assigned Role</p>
              <div className="flex items-center gap-2 text-gray-700">
                <Users className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-sm font-semibold">{tender.role}</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Opening Date</p>
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-sm font-semibold">{tender.openingDate}</span>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-6 flex gap-3">
            <AlertCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-orange-900 text-[11px] uppercase tracking-wider">Evaluation Protocol</h4>
              <p className="text-orange-800/80 text-xs leading-relaxed mt-1 font-medium">
                You are accessing the secure workspace for <span className="font-bold">{tender.bidsCount} bids</span>. Ensure your COI declaration is finalized before scoring.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-gray-200 font-bold text-[11px] uppercase tracking-wider text-gray-500 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button 
              className="flex-[1.5] py-3 px-4 rounded-xl bg-[#9A3B12] text-white font-bold text-[11px] uppercase tracking-wider shadow-md shadow-[#9A3B12]/20 hover:bg-[#7a2f0e] transition-all"
              onClick={() => {
                alert("Navigating to Evaluation Workspace...");
                onClose();
              }}
            >
              Enter Workspace
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
