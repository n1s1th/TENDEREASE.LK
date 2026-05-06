"use client";

import { useState } from "react";
import { X, Lock, FileText, Download, Users, Settings, ArrowRight } from "lucide-react";

interface QuickActionModalProps {
  type: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickActionModal({ type, isOpen, onClose }: QuickActionModalProps) {
  const [isRealtimeEnabled, setIsRealtimeEnabled] = useState(true);
  
  if (!isOpen || !type) return null;

  const getContent = () => {
    switch (type) {
      case "Open Bid Session":
        return {
          icon: <Lock className="w-5 h-5 text-[#953002]" />,
          title: "Secure Bid Opening",
          desc: "Initialize a new bid opening session. This requires authorized witness PINs.",
          primaryAction: "Start Session",
          extra: (
            <div className="space-y-3 mt-4">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active Witnesses Required</p>
                <p className="text-sm font-bold text-gray-900 mt-1">3 / 5 Present</p>
              </div>
            </div>
          )
        };
      case "View Opening Records":
        return {
          icon: <FileText className="w-5 h-5 text-[#953002]" />,
          title: "Opening Logs",
          desc: "Review the historical records of previously opened bid sessions.",
          primaryAction: "View Full Logs",
          extra: (
            <div className="mt-4 space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-700">TR-2024-00{i}</p>
                  <p className="text-[10px] text-gray-400">12 May 2026</p>
                </div>
              ))}
            </div>
          )
        };
      case "Download Bid Documents":
        return {
          icon: <Download className="w-5 h-5 text-[#953002]" />,
          title: "Document Export",
          desc: "Export all active bid documents and technical specifications in bulk.",
          primaryAction: "Download ZIP",
          extra: (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-100 rounded-xl">
              <p className="text-[10px] text-orange-800 font-bold uppercase tracking-wider">Export Format</p>
              <p className="text-xs text-orange-700/80 font-medium mt-1">Standardized PDF with Excel Summary</p>
            </div>
          )
        };
      case "Committee Roster":
        return {
          icon: <Users className="w-5 h-5 text-[#953002]" />,
          title: "Member Directory",
          desc: "View and manage the assigned committee members for current projects.",
          primaryAction: "Manage Roster",
          extra: (
            <div className="mt-4 -space-y-1">
              <p className="text-xs font-bold text-gray-700 p-2">Dr. Sarah Jenkins (Chair)</p>
              <p className="text-xs font-bold text-gray-700 p-2">John Doe (Technical)</p>
            </div>
          )
        };
      case "System Settings":
        return {
          icon: <Settings className="w-5 h-5 text-[#953002]" />,
          title: "Dashboard Config",
          desc: "Adjust your workspace preferences, notifications, and display settings.",
          primaryAction: "Save Changes",
          extra: (
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-gray-600">
                <span>Real-time Updates</span>
                <button 
                  onClick={() => setIsRealtimeEnabled(!isRealtimeEnabled)}
                  className={`w-8 h-4 rounded-full relative transition-all duration-300 ease-in-out outline-none focus:ring-2 focus:ring-[#953002]/20 ${isRealtimeEnabled ? 'bg-[#953002]' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isRealtimeEnabled ? 'left-[1.125rem]' : 'left-0.5'}`}></div>
                </button>
              </div>
            </div>
          )
        };
      default:
        return null;
    }
  };

  const content = getContent();
  if (!content) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] transition-all animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl animate-in zoom-in-95 duration-200 border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative p-6">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-[#953002]/10 rounded-md">
              {content.icon}
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Quick Action</span>
          </div>
          
          <h2 className="text-lg font-black text-gray-900 leading-tight uppercase tracking-tight">{content.title}</h2>
          <p className="text-gray-500 text-xs font-medium mt-2 leading-relaxed">
            {content.desc}
          </p>

          {content.extra}

          <div className="mt-8 flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-gray-200 font-bold text-[10px] uppercase tracking-wider text-gray-400 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button 
              className="flex-[1.5] py-3 px-4 rounded-xl bg-[#953002]/5 text-[#953002] border border-[#953002]/10 font-bold text-[10px] uppercase tracking-widest hover:bg-[#953002]/10 transition-all flex items-center justify-center gap-2"
              onClick={() => {
                alert(`Action: ${content.primaryAction} triggered!`);
                onClose();
              }}
            >
              {content.primaryAction}
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
