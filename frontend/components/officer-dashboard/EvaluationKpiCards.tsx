"use client";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useEvaluationStore, selectMetrics } from "@/store/evaluation/evaluation.store";

function CountUp({ end, duration = 1500 }: { end: number, duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return <>{count}</>;
}

export default function EvaluationKpiCards() {
  const metrics = useEvaluationStore(useShallow(selectMetrics));

  const cards = [
    { title: "ACTIVE TENDERS", subtitle: "IN PROGRESS", value: metrics.active },
    { title: "TOTAL BIDS RECEIVED", subtitle: "ALL TENDERS", value: metrics.bids },
    { title: "UNDER EVALUATION", subtitle: "PENDING FINAL", value: metrics.evaluating },
    { title: "EVALUATION COMPLETED", subtitle: "COMPLETED EVALUATIONS", value: metrics.completed || 0 },
    { title: "AWARDED PROPOSALS", subtitle: "SUCCESSFUL", value: metrics.awarded },
  ];

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      {cards.map((card, idx) => (
        <div 
          key={idx} 
          className="bg-[#9A3B12] text-white rounded-xl p-5 flex-1 min-w-[180px] shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-pointer"
        >
          <div className="text-[12px] font-bold uppercase tracking-wider whitespace-nowrap">{card.title}</div>
          <div className="text-[10px] uppercase opacity-80 mt-1 mb-3">{card.subtitle}</div>
          <div className="text-4xl font-bold">
            <CountUp end={card.value} />
          </div>
        </div>
      ))}
    </div>
  );
}
