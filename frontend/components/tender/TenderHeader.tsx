import { Calendar, CircleDollarSign, Building2, Clock, ShieldCheck, Share2 } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    <Card className="overflow-hidden">
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
          <div className="space-y-4 max-w-4xl">
            {/* Status and ID */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-success/10 text-success text-xs font-semibold rounded-md border border-success/20">
                <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                {tender?.status || "OPEN"}
              </div>
              <div className="px-2.5 py-0.5 bg-muted text-muted-foreground text-xs font-semibold rounded-md border border-border">
                ID: {tender?.tenderNumber || "TBA"}
              </div>
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 bg-info/10 text-info text-xs font-semibold rounded-md border border-info/20">
                <ShieldCheck size={14} />
                Verified
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                {tender?.title || "Loading Title..."}
              </h1>
              <p className="text-sm text-muted-foreground">
                {tender?.description || "No description available for this tender."}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-row lg:flex-col items-center gap-3 w-full lg:w-auto">
            {tender?.id ? (
              <Link href={`/tenders/${tender.id}/apply`} className="flex-1 lg:w-full">
                <Button className="w-full uppercase font-bold tracking-wider" size="lg">
                  Apply Now
                </Button>
              </Link>
            ) : (
              <Button disabled className="flex-1 lg:w-full uppercase font-bold tracking-wider" size="lg">
                Apply Now
              </Button>
            )}
            <Button variant="outline" size="icon" className="shrink-0 h-11 w-11">
              <Share2 size={18} />
            </Button>
          </div>
        </div>

        {/* Info Grid */}
        <div className="mt-8 pt-8 border-t border-border">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <InfoItem 
              icon={<Calendar className="text-primary" size={20} />} 
              label="Closing Date" 
              value={tender?.closingDate ? new Date(tender.closingDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "TBA"} 
            />
            <InfoItem 
              icon={<CircleDollarSign className="text-primary" size={20} />} 
              label="Estimated Budget" 
              value={formatBudget(tender?.estimatedBudget)} 
            />
            <InfoItem 
              icon={<Building2 className="text-primary" size={20} />} 
              label="Department" 
              value={tender?.departmentName || "TBA"} 
            />
            <InfoItem 
              icon={<Clock className="text-primary" size={20} />} 
              label="Time Remaining" 
              value={formatTimeRemaining(tender?.timeRemaining)} 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-medium text-muted-foreground mb-0.5">{label}</span>
        <span className="text-sm font-semibold text-foreground">{value}</span>
      </div>
    </div>
  );
}