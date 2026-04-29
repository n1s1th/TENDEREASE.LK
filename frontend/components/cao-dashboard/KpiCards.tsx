"use client";

import { useRouter } from "next/navigation";
import { FileText, Award, Clock, Users } from "lucide-react";
import type { KpiSummary } from "@/lib/types/cao-dashboard.types";

interface KpiCardsProps {
  data: KpiSummary | null;
}

export default function KpiCards({ data }: KpiCardsProps) {
  const router = useRouter();

  const cards = [
    {
      title: "Active Tenders",
      value: data?.activeTenders ?? 0,
      change: data?.activeTendersChange ?? 0,
      suffix: "",
      icon: <FileText size={20} />,
    },
    {
      title: "Awarded Tenders",
      value: data?.awardedTenders ?? 0,
      change: data?.awardedTendersChange ?? 0,
      suffix: "",
      icon: <Award size={20} />,
    },
    {
      title: "Average Cycle Time",
      value: data?.avgCycleTime ?? 0,
      change: data?.avgCycleTimeChange ?? 0,
      suffix: " days",
      icon: <Clock size={20} />,
    },
    {
      title: "SME Participation",
      value: data?.smeParticipation ?? 0,
      change: data?.smeParticipationChange ?? 0,
      suffix: "%",
      icon: <Users size={20} />,
    },
  ];

  return (
    <div className="dash-kpi-row" id="kpi-cards" style={{ marginBottom: "2.5rem", marginTop: "4.0rem" }}>
      {cards.map((card) => {
        const isPositive = card.change >= 0;
        return (
          <div
            key={card.title}
            className="dash-kpi-card hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-pointer"
            onClick={() => router.push("/cao-dashboard/reports")}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.25rem" }}>
              <div className="dash-kpi-title">{card.title}</div>
              {card.change !== 0 && (
                <span style={{
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  padding: "0.15rem 0.5rem",
                  borderRadius: 12,
                  background: isPositive ? "#ecfdf5" : "#fef2f2",
                  color: isPositive ? "#059669" : "#dc2626",
                }}>
                  {isPositive ? "+" : ""}{card.change}%
                </span>
              )}
            </div>
            <div className="dash-kpi-value" style={{ fontSize: "2rem", fontWeight: 700, margin: "0.25rem 0" }}>
              {card.value}{card.suffix}
            </div>
            <div style={{ textAlign: "right" }}>
              <button
                className="dash-btn dash-btn--ghost dash-btn--sm"
                style={{ fontSize: "0.78rem", padding: "0.2rem 0" }}
                onClick={(e) => {
                  e.stopPropagation(); // prevent double trigger
                  router.push("/cao-dashboard/reports");
                }}
              >
                View details →
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
