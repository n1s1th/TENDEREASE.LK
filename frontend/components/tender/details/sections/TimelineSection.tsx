import { CheckCircle, Clock, Circle } from "lucide-react";

interface TimelineItem {
  title: string;
  date: string;
  status: "completed" | "upcoming" | "pending";
}

const timeline: TimelineItem[] = [
  {
    title: "Tender Published",
    date: "June 15, 2025",
    status: "completed",
  },
  {
    title: "Pre-Bid Meeting",
    date: "June 25, 2025",
    status: "completed",
  },
  {
    title: "Clarification Deadline",
    date: "July 10, 2025",
    status: "upcoming",
  },
  {
    title: "Bid Submission Deadline",
    date: "July 30, 2025",
    status: "upcoming",
  },
  {
    title: "Technical Evaluation",
    date: "August 05, 2025",
    status: "pending",
  },
];

export default function TimelineSection() {
  return (
    <div className="bg-white rounded-xl shadow-sm px-6 py-6 space-y-6">

      <h2 className="font-semibold text-sm">
        Important Dates
      </h2>

      <div className="space-y-6">

        {timeline.map((item, index) => {
          const isCompleted = item.status === "completed";
          const isUpcoming = item.status === "upcoming";
          const isPending = item.status === "pending";

          return (
            <div
              key={index}
              className="flex justify-between items-center border-b pb-5"
            >

              {/* Left Side */}
              <div className="flex items-start gap-4">

                <div className="mt-1">
                  {isCompleted && (
                    <CheckCircle size={20} className="text-green-600" />
                  )}
                  {isUpcoming && (
                    <Clock size={20} className="text-amber-600" />
                  )}
                  {isPending && (
                    <Circle size={20} className="text-gray-400" />
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium">
                    {item.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.date}
                  </p>
                </div>

              </div>

              {/* Status Badge */}
              <div>
                {isCompleted && (
                  <span className="bg-green-100 text-green-700 px-4 py-2 rounded-md text-xs font-medium">
                    Completed
                  </span>
                )}

                {isUpcoming && (
                  <span className="bg-amber-100 text-amber-700 px-4 py-2 rounded-md text-xs font-medium">
                    Upcoming
                  </span>
                )}

                {isPending && (
                  <span className="bg-gray-200 text-gray-600 px-4 py-2 rounded-md text-xs font-medium">
                    Pending
                  </span>
                )}
              </div>

            </div>
          );
        })}

      </div>

      {/* Project Duration */}
      <div className="pt-4 space-y-2">

        <h3 className="text-sm font-semibold">
          Project Duration
        </h3>

        <p className="text-xs text-gray-600 leading-relaxed">
          Expected contract duration: 12 months from the date of contract signing.
        </p>

      </div>

    </div>
  );
}
