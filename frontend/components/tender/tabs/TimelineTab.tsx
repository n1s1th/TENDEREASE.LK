"use client";

import {
  Calendar, CheckCircle2, Circle, Clock, Timer,
  FilePlus2, ThumbsUp, ThumbsDown, Megaphone,
  Unlock, ClipboardList, Award, XCircle, Ban,
} from "lucide-react";
import type { TimelineEventType } from "@/lib/types/tender.types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Human-readable labels for each timeline event type
const EVENT_LABELS: Record<TimelineEventType, string> = {
  CREATED:             "Tender Created",
  SUBMITTED:           "Submitted for Approval",
  APPROVED:            "Approved by CAO",
  REJECTED:            "Rejected",
  PUBLISHED:           "Published",
  OPENED:              "Bid Opening",
  EVALUATION_STARTED:  "Evaluation Started",
  AWARDED:             "Contract Awarded",
  NO_BID:              "No Bids Received",
  CLOSED:              "Tender Closed",
  CANCELLED:           "Cancelled",
  AMENDED:             "Addendum Issued",
};

const EVENT_ICONS: Record<TimelineEventType, React.ReactNode> = {
  CREATED:             <FilePlus2 size={16} />,
  SUBMITTED:           <Clock size={16} />,
  APPROVED:            <ThumbsUp size={16} />,
  REJECTED:            <ThumbsDown size={16} />,
  PUBLISHED:           <Megaphone size={16} />,
  OPENED:              <Unlock size={16} />,
  EVALUATION_STARTED:  <ClipboardList size={16} />,
  AWARDED:             <Award size={16} />,
  NO_BID:              <Circle size={16} />,
  CLOSED:              <CheckCircle2 size={16} />,
  CANCELLED:           <Ban size={16} />,
  AMENDED:             <XCircle size={16} />,
};

const EVENT_COLORS: Record<TimelineEventType, { dot: string; icon: string; badge: string; line: string }> = {
  CREATED:             { dot: "border-blue-200 bg-blue-50",   icon: "text-blue-500",   badge: "bg-blue-50 text-blue-700 border-blue-100",   line: "bg-blue-100" },
  SUBMITTED:           { dot: "border-amber-200 bg-amber-50", icon: "text-amber-500",  badge: "bg-amber-50 text-amber-700 border-amber-100", line: "bg-amber-100" },
  APPROVED:            { dot: "border-green-200 bg-green-50", icon: "text-green-500",  badge: "bg-green-50 text-green-700 border-green-100", line: "bg-green-200" },
  REJECTED:            { dot: "border-red-200 bg-red-50",     icon: "text-red-500",    badge: "bg-red-50 text-red-700 border-red-100",       line: "bg-red-100" },
  PUBLISHED:           { dot: "border-indigo-200 bg-indigo-50", icon: "text-indigo-500", badge: "bg-indigo-50 text-indigo-700 border-indigo-100", line: "bg-indigo-100" },
  OPENED:              { dot: "border-cyan-200 bg-cyan-50",   icon: "text-cyan-500",   badge: "bg-cyan-50 text-cyan-700 border-cyan-100",   line: "bg-cyan-100" },
  EVALUATION_STARTED:  { dot: "border-purple-200 bg-purple-50", icon: "text-purple-500", badge: "bg-purple-50 text-purple-700 border-purple-100", line: "bg-purple-100" },
  AWARDED:             { dot: "border-yellow-200 bg-yellow-50", icon: "text-yellow-500", badge: "bg-yellow-50 text-yellow-700 border-yellow-100", line: "bg-yellow-100" },
  NO_BID:              { dot: "border-gray-200 bg-gray-50",   icon: "text-gray-500",   badge: "bg-gray-50 text-gray-700 border-gray-100",   line: "bg-gray-100" },
  CLOSED:              { dot: "border-green-300 bg-green-100", icon: "text-green-700",  badge: "bg-green-100 text-green-800 border-green-200", line: "bg-green-200" },
  CANCELLED:           { dot: "border-red-300 bg-red-100",    icon: "text-red-700",    badge: "bg-red-100 text-red-800 border-red-200",      line: "bg-red-200" },
  AMENDED:             { dot: "border-orange-200 bg-orange-50", icon: "text-orange-500", badge: "bg-orange-50 text-orange-700 border-orange-100", line: "bg-orange-100" },
};

export default function TimelineTab({ timeline }: { timeline?: any[] }) {
  if (!timeline || timeline.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 flex flex-col items-center justify-center text-center">
          <div className="h-12 w-12 rounded-full bg-grey-1 flex items-center justify-center mb-4 text-muted-foreground">
            <Calendar size={24} />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">No Timeline Events</h3>
          <p className="text-sm text-muted-foreground max-w-sm">There are no timeline events recorded for this tender yet.</p>
        </CardContent>
      </Card>
    );
  }

  // Sort chronologically (oldest first for display)
  const sorted = [...timeline].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary/10">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <CardTitle>Procurement Timeline</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-8">
          <div className="relative space-y-0 pb-6 pl-4">
            {sorted.map((event: any, index: number) => {
              const type: TimelineEventType = event.eventType;
              const colors = EVENT_COLORS[type] ?? EVENT_COLORS.CREATED;
              const icon   = EVENT_ICONS[type]  ?? <Circle size={16} />;
              const label  = EVENT_LABELS[type] ?? type?.replace(/_/g, " ");
              const isLast = index === sorted.length - 1;

              const dateStr = event.timestamp
                ? new Date(event.timestamp).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric",
                  })
                : "TBA";
              const timeStr = event.timestamp
                ? new Date(event.timestamp).toLocaleTimeString("en-US", {
                    hour: "2-digit", minute: "2-digit",
                  })
                : "";

              return (
                <div key={index} className="flex gap-6 group relative">
                  {/* Left: dot + connector line */}
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-md flex items-center justify-center border ${colors.dot} ${colors.icon} z-10 bg-white relative`}>
                      {icon}
                    </div>
                    {!isLast && (
                      <div className={`w-px flex-1 ${colors.line} -my-1 min-h-[48px]`}></div>
                    )}
                  </div>

                  {/* Right: content */}
                  <div className="flex-1 pb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-1.5">
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-foreground">
                          {label}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                          <Clock size={12} />
                          <span>{dateStr}</span>
                          {timeStr && <span>· {timeStr}</span>}
                        </div>
                      </div>
                      <span className={`self-start sm:self-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${colors.badge}`}>
                        {label}
                      </span>
                    </div>
                    {event.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Duration summary */}
      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-md bg-grey-1 border border-border text-muted-foreground">
            <Timer size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Contract Duration</p>
            <p className="text-sm font-semibold text-foreground">
              Refer to the technical documentation for specific contract duration.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
