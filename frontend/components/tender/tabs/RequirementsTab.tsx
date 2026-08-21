"use client";

import { FileText, CheckCircle2, ShieldCheck, ListChecks, FileCode } from "lucide-react";

export default function RequirementsTab({ tender }: any) {
  const specialRequirements = tender?.specialRequirements ? tender.specialRequirements.split("\n").filter((i: string) => i.trim() !== "") : [];
  const technicalSpecifications = tender?.scopeOfWork ? tender.scopeOfWork.split("\n").filter((i: string) => i.trim() !== "") : [];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-500">
      {/* Dynamic Requirements from Backend */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-info/10 rounded-xl flex items-center justify-center text-info border border-info/10">
            <ShieldCheck size={20} />
          </div>
          <h2 className="text-xl font-black text-black-1 tracking-tight">Special Requirements & Eligibility</h2>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {specialRequirements.length > 0 ? (
            specialRequirements.map((item: string, index: number) => (
              <div key={index} className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-gray-100 hover:border-primary/20 hover:shadow-premium transition-all duration-300 group">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 group-hover:scale-125 transition-transform shrink-0"></div>
                <span className="text-sm text-black-2 font-bold leading-relaxed">
                  {item}
                </span>
              </div>
            ))
          ) : (
            <div className="p-8 text-center bg-gray-5/50 border border-dashed border-gray-100 rounded-[2rem]">
              <p className="text-sm text-gray-3">Refer to the official tender documents for eligibility criteria.</p>
            </div>
          )}
        </div>
      </section>

      {/* Technical Specifications from Scope of Work */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-warning/10 rounded-xl flex items-center justify-center text-warning border border-warning/10">
            <FileCode size={20} />
          </div>
          <h2 className="text-xl font-black text-black-1 tracking-tight">Technical Specifications</h2>
        </div>

        {technicalSpecifications.length > 0 ? (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 px-2">
            {technicalSpecifications.map((item: string, index: number) => (
              <li key={index} className="flex items-center gap-4 py-2 border-b border-gray-5">
                <CheckCircle2 className="text-success shrink-0" size={18} />
                <span className="text-sm text-black-2 font-semibold">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-3 px-2 italic">Detailed technical specifications are available in the downloaded package.</p>
        )}
      </section>
    </div>
  );
}