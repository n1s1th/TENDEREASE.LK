"use client";

export default function EvaluationStatusPanel() {
  const statuses = [
    { label: "Technical Pass", count: 0, color: "bg-green-500" },
    { label: "Under Technical Review", count: 0, color: "bg-blue-500" },
    { label: "Pending Finance", count: 0, color: "bg-yellow-400" },
    { label: "Under Financial Review", count: 0, color: "bg-yellow-500" },
    { label: "Rejected", count: 0, color: "bg-red-500" },
    { label: "Not Reviewed", count: 0, color: "bg-gray-400" },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 w-full">
      <h3 className="text-xs font-bold uppercase tracking-wider mb-4 border-b pb-2 text-gray-800">
        EVALUATION STATUS
      </h3>
      <div className="flex flex-col gap-6 mt-6">
        {statuses.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
              <span className="text-gray-700 font-medium">{item.label}</span>
            </div>
            <span className="font-bold text-gray-900">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
