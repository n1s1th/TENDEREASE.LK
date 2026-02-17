import { Circle } from "lucide-react";

type Status = "completed" | "upcoming" | "pending";

interface Event {
  title: string;
  date: string;
  status: Status;
}

const events: Event[] = [
  { title: "Tender Published", date: "July 01, 2025", status: "completed" },
  { title: "Pre-bid Meeting", date: "July 10, 2025", status: "completed" },
  { title: "Clarification Deadline", date: "July 20, 2025", status: "upcoming" },
  { title: "Bid Submission Deadline", date: "July 30, 2025", status: "upcoming" },
  { title: "Technical Evaluation", date: "August 05, 2025", status: "pending" },
  { title: "Financial Evaluation", date: "August 12, 2025", status: "pending" },
];

const statusStyles = {
  completed: {
    circle: "text-green-600 fill-green-600",
    badge: "bg-green-100 text-green-700",
    label: "Completed",
  },
  upcoming: {
    circle: "text-yellow-500 fill-yellow-500",
    badge: "bg-yellow-100 text-yellow-700",
    label: "Upcoming",
  },
  pending: {
    circle: "text-gray-400 fill-gray-400",
    badge: "bg-gray-200 text-gray-600",
    label: "Pending",
  },
};

export default function TimelineSection() {
  return (
    <div className="bg-white p-3 rounded-md shadow-sm space-y-4">
      <h2 className="font-semibold text-sm">Important Dates</h2>

      {events.map((event, index) => {
        const style = statusStyles[event.status];

        return (
          <div key={index} className="flex justify-between items-start gap-4">

            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <Circle size={10} className={style.circle} />
                {index !== events.length - 1 && (
                  <div className="w-px h-8 bg-gray-300"></div>
                )}
              </div>

              <div>
                <p className="text-sm font-medium">{event.title}</p>
                <p className="text-xs text-gray-500">{event.date}</p>
              </div>
            </div>

            <span
              className={`text-xs px-3 py-1 rounded-md ${style.badge}`}
            >
              {style.label}
            </span>

          </div>
        );
      })}

      <div className="pt-3 border-t">
        <h3 className="text-sm font-medium">Project Duration</h3>
        <p className="text-xs text-gray-600">
          Expected contract duration: 18 months from contract signing.
        </p>
      </div>
    </div>
  );
}
