"use client";

import { useState, useEffect } from "react";
import { fetchEvaluationStatusCounts } from "@/lib/api/evaluation.api";
import type { EvaluationStatusCounts } from "@/lib/api/evaluation.api";

export default function EvaluationStatusPanel() {
  const [counts, setCounts] = useState<EvaluationStatusCounts>({
    technicalPassed: 0,
    technicalFailed: 0,
    financialPassed: 0,
    financialFailed: 0,
    evaluationFailed: 0,
    notReviewed: 0,
  });

  useEffect(() => {
    const loadCounts = async () => {
      try {
        const data = await fetchEvaluationStatusCounts();
        setCounts(data);
      } catch (err) {
        console.error("Failed to fetch evaluation status counts", err);
      }
    };
    loadCounts();
  }, []);

  const statuses = [
    { label: "Technical Passed", count: counts.technicalPassed, color: "bg-green-500" },
    { label: "Financial Passed", count: counts.financialPassed, color: "bg-blue-500" },
    { label: "Financial Failed", count: counts.financialFailed, color: "bg-yellow-500" },
    { label: "Evaluation Failed", count: counts.evaluationFailed, color: "bg-red-500" },
    { label: "Not Reviewed", count: counts.notReviewed, color: "bg-gray-400" },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-black text-gray-400 uppercase tracking-[0.2em]">Evaluation Status</h3>
      </div>
      
      <div className="flex flex-col gap-3 flex-1 justify-evenly">
        {statuses.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className={`w-2.5 h-2.5 rounded-full ${item.color} shadow-sm ring-4 ring-transparent group-hover:ring-${item.color.split('-')[1]}/10 transition-all`}></div>
              <span className="text-[15px] font-bold text-gray-700 tracking-tight">{item.label}</span>
            </div>
            <span className="text-[15px] font-black text-gray-900 font-mono tracking-tighter bg-gray-50 px-2.5 py-0.5 rounded-lg border border-gray-100">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
