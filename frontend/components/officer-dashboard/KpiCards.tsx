"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { KpiSummary } from "@/lib/types/officer-dashboard.types";

interface KpiCardsProps {
  data: KpiSummary | null;
}

export default function KpiCards({ data }: KpiCardsProps) {
  const cards = [
    {
      title: "Active Tenders",
      value: data?.activeTenders ?? "—",
      change: data?.activeTendersChange ?? null,
      subtitle: "Click to view report",
      link: "/officer-dashboard/reports",
    },
    {
      title: "Awarded Tenders",
      value: data?.awardedTenders ?? "—",
      change: data?.awardedTendersChange ?? null,
      subtitle: "Click to view report",
      link: "/officer-dashboard/reports",
    },
    {
      title: "Average Cycle Time",
      value: data ? `${data.avgCycleTime} days` : "—",
      change: data?.avgCycleTimeChange ?? null,
      subtitle: "Click to view report",
      link: "/officer-dashboard/reports",
    },
    {
      title: "SME Participation",
      value: data ? `${data.smeParticipation}%` : "—",
      change: data?.smeParticipationChange ?? null,
      subtitle: "Click to view report",
      link: "/officer-dashboard/reports",
    },
  ];

  return (
    <div className="dash-kpi-row" id="kpi-cards">
      {cards.map((card) => (
        <div key={card.title} className="dash-kpi-card">
          <div className="dash-kpi-title">{card.title}</div>
          <div>
            <span className="dash-kpi-value">{card.value}</span>
            {card.change !== null && (
              <span
                className={`dash-kpi-change ${
                  card.change >= 0 ? "dash-kpi-change--up" : "dash-kpi-change--down"
                }`}
              >
                {card.change >= 0 ? "+" : ""}
                {card.change}%
              </span>
            )}
          </div>
          <div className="dash-kpi-subtitle">{card.subtitle}</div>
          <Link href={card.link} className="dash-kpi-link">
            View details <ArrowRight size={12} />
          </Link>
        </div>
      ))}
    </div>
  );
}
