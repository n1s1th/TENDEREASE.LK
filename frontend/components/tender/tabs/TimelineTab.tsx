"use client";

import { Calendar, CheckCircle2, Circle, Clock, Timer } from "lucide-react";

export default function TimelineTab({ timeline }: any) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="py-20 text-center space-y-4 bg-gray-5/50 border border-dashed border-gray-100 rounded-[2rem]">
        <div className="w-16 h-16 bg-gray-5 rounded-full flex items-center justify-center mx-auto text-gray-3">
          <Calendar size={32} />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-black text-black-1">No Timeline Events</h3>
          <p className="text-sm text-gray-3">There are no timeline events recorded for this tender yet.</p>
        </div>
      </div>
    );
  }

  const timelineData = timeline.map((event: any) => ({
    label: event.eventType?.replace(/_/g, " "),
    date: event.timestamp ? new Date(event.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "TBA",
    status: "Completed", // Events in list are usually completed history
    description: event.description
  }));

  const getStatusStyles = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return {
          bg: "bg-green-50 text-green-700 border-green-100",
          icon: <CheckCircle2 size={16} className="text-green-500" />,
          line: "bg-green-200",
        };
      case "upcoming":
        return {
          bg: "bg-blue-50 text-blue-700 border-blue-100",
          icon: <Clock size={16} className="text-blue-500" />,
          line: "bg-blue-100",
        };
      case "pending":
      default:
        return {
          bg: "bg-gray-50 text-gray-400 border-gray-100",
          icon: <Circle size={16} className="text-gray-300" />,
          line: "bg-gray-100",
        };
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div className="space-y-1 px-2">
        <h2 className="text-2xl font-black text-black-1 tracking-tight">Procurement Timeline</h2>
        <p className="text-sm font-medium text-gray-3">Key milestones and deadlines for the tender process.</p>
      </div>

      <div className="relative space-y-0 pb-10">
        {timelineData.map((event: any, index: number) => {
          const styles = getStatusStyles(event.status);
          const isLast = index === timelineData.length - 1;
          
          return (
            <div key={index} className="flex gap-8 group">
              {/* Left Side: Timeline Line and Dot */}
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center bg-white border-2 border-gray-100 shadow-sm relative z-10 group-hover:scale-110 group-hover:border-primary/20 transition-transform duration-300`}>
                  {styles.icon}
                </div>
                {!isLast && (
                  <div className={`w-0.5 h-full ${styles.line} -my-2 min-h-[80px]`}></div>
                )}
              </div>
              
              {/* Right Side: Content */}
              <div className="flex-1 pb-12">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                  <div className="space-y-1">
                    <p className="text-base font-black text-black-1 group-hover:text-primary transition-colors uppercase tracking-tight">
                      {event.label}
                    </p>
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-3">
                      <Calendar size={12} />
                      {event.date}
                    </div>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles.bg} self-start sm:self-center`}>
                    {event.status}
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-1 leading-relaxed max-w-2xl">
                  {event.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Project Duration Summary */}
      <div className="bg-gray-5 rounded-3xl p-8 border border-gray-100 group">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-3 border border-gray-100 group-hover:text-primary group-hover:border-primary/20 transition-all duration-300">
            <Timer size={24} />
          </div>
          <div>
            <h4 className="text-xs font-black text-gray-3 uppercase tracking-widest mb-1">Contract Duration</h4>
            <p className="text-base font-black text-black-1">
              Refer to the technical documentation for specific contract duration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}