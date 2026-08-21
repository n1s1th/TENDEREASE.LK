import { Calendar, CircleDollarSign, Building2, Clock, ShieldCheck, Share2 } from "lucide-react";
import Link from "next/link";

export default function TenderHeader({ tender }: any) {
  const formatBudget = (amount: any) => {
    if (!amount) return "TBA";
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTimeRemaining = (seconds: number) => {
    if (!seconds || seconds <= 0) return "Closed";
    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    return `${days} Days ${hours} Hours`;
  };

  return (
    <div className="bg-white border border-gray-100 rounded-[2rem] p-8 sm:p-10 shadow-premium relative overflow-hidden group">
      {/* Decorative Background Element using Brand Secondary */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -mr-32 -mt-32 transition-transform group-hover:scale-110 duration-700"></div>
      
      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
          <div className="space-y-6 max-w-4xl">
            {/* Status and ID */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-success/10 text-success text-[10px] font-black uppercase tracking-wider rounded-lg border border-success/10">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
                {tender?.status || "OPEN"}
              </div>
              <div className="px-3 py-1 bg-gray-5 text-gray-3 text-[10px] font-black uppercase tracking-wider rounded-lg border border-gray-5">
                ID: {tender?.tenderNumber || "TBA"}
              </div>
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-info/10 text-info text-[10px] font-black uppercase tracking-wider rounded-lg border border-info/20">
                <ShieldCheck size={12} />
                Verified
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-black text-black-1 leading-[1.15] tracking-tight">
                {tender?.title || "Loading Title..."}
              </h1>
              <p className="text-base text-gray-2 font-medium leading-relaxed max-w-3xl">
                {tender?.description || "No description available for this tender."}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-row lg:flex-col items-center gap-3 w-full lg:w-auto">
            {tender?.id ? (
              <Link href={`/tenders/${tender.id}/apply`} className="flex-1 lg:w-full">
                <button className="w-full bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:shadow-primary shadow-sm active:scale-[0.98]">
                  Apply Now
                </button>
              </Link>
            ) : (
              <button className="flex-1 lg:w-full bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:shadow-primary shadow-sm active:scale-[0.98] opacity-50 cursor-not-allowed">
                Apply Now
              </button>
            )}
            <button className="p-4 bg-white border border-gray-100 text-gray-3 hover:text-primary hover:border-primary/20 rounded-2xl transition-all shadow-sm active:scale-[0.98]">
              <Share2 size={20} />
            </button>
          </div>
        </div>

        {/* Info Grid */}
        <div className="mt-12 pt-10 border-t border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <InfoItem 
              icon={<Calendar className="text-error" size={24} />} 
              label="Closing Date" 
              value={tender?.closingDate ? new Date(tender.closingDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "TBA"} 
            />
            <InfoItem 
              icon={<CircleDollarSign className="text-success" size={24} />} 
              label="Estimated Budget" 
              value={formatBudget(tender?.estimatedBudget)} 
            />
            <InfoItem 
              icon={<Building2 className="text-info" size={24} />} 
              label="Department" 
              value={tender?.departmentName || "TBA"} 
            />
            <InfoItem 
              icon={<Clock className="text-warning" size={24} />} 
              label="Time Remaining" 
              value={formatTimeRemaining(tender?.timeRemaining)} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-5 group">
      <div className="w-14 h-14 rounded-2xl bg-gray-5 flex items-center justify-center border border-gray-100 group-hover:bg-white group-hover:border-primary/10 group-hover:shadow-premium transition-all duration-300">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-black text-gray-3 uppercase tracking-[0.2em] mb-1">{label}</span>
        <span className="text-sm font-bold text-black-2 group-hover:text-primary transition-colors">{value}</span>
      </div>
    </div>
  );
}