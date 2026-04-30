"use client";

import { BarChart2, Bell, Cpu, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: BarChart2,
    iconBg: "#eff6ff",
    iconColor: "#953002",
    title: "KPI Dashboards",
    description:
      "Track procurement performance, vendor activity, and key metrics through intuitive, real-time dashboards.",
  },
  {
    icon: Bell,
    iconBg: "#fff7ed",
    iconColor: "#c2410c",
    title: "Smart Notifications",
    description:
      "Get real-time alerts for new tenders, approaching deadlines, bid updates, and status changes.",
  },
  {
    icon: Cpu,
    iconBg: "#f0fdf4",
    iconColor: "#15803d",
    title: "AI Smart Matching",
    description:
      "Discover the most relevant tenders automatically based on your vendor profile, category, and history.",
  },
  {
    icon: ShieldCheck,
    iconBg: "#faf5ff",
    iconColor: "#7c3aed",
    title: "Audit & Transparency",
    description:
      "Full audit logs and compliance tracking for every action — ensuring accountability at every step.",
  },
];

export default function CoreFeatures() {
  return (
    <section style={{ background: "#fffcfb", padding: "5rem 1.5rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <p style={{
            fontSize: "0.8rem",
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#953002",
            marginBottom: "0.5rem",
          }}>
            Platform
          </p>
          <h2 style={{
            fontSize: "clamp(1.6rem, 3vw, 2.25rem)",
            fontWeight: 800,
            color: "#111827",
            margin: "0 0 0.75rem",
          }}>
            Core Features
          </h2>
          <p style={{
            fontSize: "1rem",
            color: "#6b7280",
            maxWidth: 500,
            margin: "0 auto",
            lineHeight: 1.7,
          }}>
            Everything you need to run a modern, efficient, and transparent tendering process
          </p>
        </div>

        {/* 2x2 grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "1.5rem",
          marginBottom: "3rem",
        }}>
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                style={{
                  background: "#fff",
                  border: "1.5px solid #e5e7eb",
                  borderRadius: 16,
                  padding: "2rem",
                  display: "flex",
                  gap: "1.25rem",
                  alignItems: "flex-start",
                  transition: "box-shadow 0.2s, border-color 0.2s",
                  cursor: "default",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 28px rgba(0,0,0,0.08)";
                  (e.currentTarget as HTMLDivElement).style.borderColor = "#c7d2fe";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                  (e.currentTarget as HTMLDivElement).style.borderColor = "#e5e7eb";
                }}
              >
                {/* Icon */}
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: feature.iconBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <Icon size={24} color={feature.iconColor} strokeWidth={1.8} />
                </div>

                {/* Text */}
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: "1.05rem",
                    fontWeight: 700,
                    color: "#111827",
                    margin: "0 0 0.5rem",
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{
                    fontSize: "0.875rem",
                    color: "#6b7280",
                    lineHeight: 1.65,
                    margin: 0,
                  }}>
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center" }}>
          <a
            href="/features"
            style={{
              display: "inline-block",
              padding: "0.75rem 2rem",
              background: "#953002",
              color: "#fff",
              borderRadius: 8,
              fontSize: "0.9rem",
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 4px 14px rgba(149,48,2,0.25)",
              transition: "background 0.15s, transform 0.1s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.background = "#1e40af";
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.background = "#953002";
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
            }}
          >
            View Features →
          </a>
        </div>
      </div>
    </section>
  );
}
