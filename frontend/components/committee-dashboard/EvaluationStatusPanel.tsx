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
    <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-[12px] font-black text-gray-400 uppercase tracking-[0.2em]">Evaluation Status</h3>
      </div>
      
      <div className="flex flex-col gap-6 flex-1 justify-center">
        {statuses.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className={`w-2.5 h-2.5 rounded-full ${item.color} shadow-sm ring-4 ring-transparent group-hover:ring-${item.color.split('-')[1]}/10 transition-all`}></div>
              <span className="text-[14px] font-bold text-gray-700 tracking-tight">{item.label}</span>
            </div>
            <span className="text-[15px] font-black text-gray-900 font-mono tracking-tighter bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
