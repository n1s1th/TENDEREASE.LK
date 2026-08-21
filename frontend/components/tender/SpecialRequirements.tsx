import { ShieldAlert, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function SpecialRequirements({ tender }: { tender: any }) {
  const requirements = tender?.specialRequirements || 
    "No special requirements or conditions have been listed for this tender.";

  return (
    <Card className="overflow-hidden bg-muted/30">
      <CardContent className="p-6">
        <div className="flex gap-4 items-start">
          <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center shrink-0">
            <ShieldAlert className="text-primary" size={20} />
          </div>
          
          <div className="flex flex-col space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">
                Special Requirements & Conditions
              </h2>
            </div>
            
            <p className="text-sm font-medium text-foreground leading-relaxed">
              {requirements}
            </p>

            <div className="flex items-center gap-2 pt-1">
              <Info size={14} className="text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Mandatory Compliance Required</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
