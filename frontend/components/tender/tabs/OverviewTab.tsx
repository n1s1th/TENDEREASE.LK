"use client";

import { CheckCircle2, Info, Target, TrendingUp } from "lucide-react";

export default function OverviewTab({ tender }: any) {
  const overview = tender?.projectOverview || tender?.description || "No project overview available.";
  
  // Backend scopeOfWork is a string, but UI expects list. Let's adapt.
  const scopeItems = tender?.scopeOfWork 
    ? tender.scopeOfWork.split("\n").filter((i: string) => i.trim() !== "")
    : ["Refer to the technical documentation for the full scope of work."];

  return (
    <div className="space-y-10">
      {/* PROJECT OVERVIEW - FULL WIDTH */}
      <section className="bg-white rounded-[2rem] p-8 sm:p-12 border border-gray-100 shadow-premium relative overflow-hidden group">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-secondary/10 rounded-full blur-3xl opacity-50 group-hover:scale-110 transition-transform duration-700"></div>
        
        <div className="relative z-10 space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary border border-primary/10 shadow-sm">
              <Info size={28} />
            </div>
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-black-1 tracking-tight">Project Overview</h2>
              <p className="text-xs font-bold text-gray-3 uppercase tracking-[0.2em]">Detailed Business Context</p>
            </div>
          </div>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-lg text-gray-1 leading-[1.8] font-medium whitespace-pre-line">
              {overview}
            </p>
          </div>

          <div className="flex items-center gap-3 pt-6 border-t border-gray-5">
            <TrendingUp size={18} className="text-success" />
            <span className="text-[11px] font-black text-gray-3 uppercase tracking-widest">
              Verified Strategic Initiative • Priority Level: High
            </span>
          </div>
        </div>
      </section>

      {/* SCOPE OF WORK - FULL WIDTH GRID */}
      <section className="space-y-8">
        <div className="flex items-center gap-4 px-4">
          <div className="w-12 h-12 bg-gray-5 rounded-2xl flex items-center justify-center text-gray-3 border border-gray-5">
            <Target size={24} />
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-black-1 tracking-tight">Scope of Work</h2>
            <p className="text-xs font-bold text-gray-3 uppercase tracking-[0.2em]">Deliverables & Responsibilities</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scopeItems.map((item: string, i: number) => (
            <div 
              key={i} 
              className="flex items-start gap-4 p-8 rounded-[2rem] bg-white border border-gray-100 hover:border-primary/20 hover:shadow-premium transition-all duration-300 group cursor-default"
            >
              <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary transition-colors shrink-0 mt-0.5 shadow-sm">
                <CheckCircle2 className="text-primary group-hover:text-white" size={16} />
              </div>
              <span className="text-base text-black-2 font-bold leading-relaxed">{item}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}