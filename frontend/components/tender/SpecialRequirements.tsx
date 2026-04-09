import { ShieldAlert, Info } from "lucide-react";

export default function SpecialRequirements({ tender }: { tender: any }) {
  const requirements = tender?.specialRequirements || 
    "No special requirements or conditions have been listed for this tender.";

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-premium relative overflow-hidden group">
      {/* Subtle Background Icon Pattern */}
      <div className="absolute -right-4 -bottom-4 opacity-[0.03] transform group-hover:scale-110 transition-transform duration-700">
        <ShieldAlert size={120} />
      </div>

      <div className="flex gap-6 items-start relative z-10">
        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/20 transition-transform duration-500 group-hover:rotate-6">
          <ShieldAlert className="text-white" size={24} />
        </div>
        
        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-2">
            <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-0.5">
              Special Requirements & Conditions
            </h2>
            <div className="h-px bg-gray-5 flex-1 min-w-[50px]"></div>
          </div>
          
          <p className="text-sm font-bold text-black-2 leading-relaxed max-w-5xl">
            {requirements}
          </p>

          <div className="flex items-center gap-2 pt-2">
            <Info size={14} className="text-secondary" />
            <span className="text-[10px] font-black text-secondary uppercase tracking-widest">Mandatory Compliance Required</span>
          </div>
        </div>
      </div>
    </div>
  );
}
