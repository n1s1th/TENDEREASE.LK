"use client";

import {
  BarChart2,
  Bell,
  Cpu,
  ShieldCheck,
  Zap,
  ArrowRight,
} from "lucide-react";

const topFeatures = [
  {
    icon: BarChart2,
    iconVariant: "brand",
    iconColor: "#953002",
    tag: "Analytics",
    number: "01",
    title: "KPI Dashboards",
    description:
      "Track procurement performance, vendor activity, and key metrics through intuitive, real-time dashboards.",
    stats: [
      { value: "98%", label: "Uptime" },
      { value: "12+", label: "Widget Types" },
      { value: "Real-time", label: "Data Sync" },
    ],
  },
  {
    icon: Cpu,
    iconVariant: "green",
    iconColor: "#15803d",
    tag: "AI Powered",
    number: "02",
    title: "AI Smart Matching",
    description:
      "Discover the most relevant tenders automatically based on your vendor profile, category, and past bidding history.",
    stats: [
      { value: "95%", label: "Match Rate" },
      { value: "3x", label: "Faster Discovery" },
      { value: "Smart", label: "Filtering" },
    ],
  },
];

const bottomFeatures = [
  {
    icon: Bell,
    iconVariant: "orange",
    iconColor: "#c2410c",
    tag: "Alerts",
    number: "03",
    title: "Smart Notifications",
    description:
      "Real-time alerts for new tenders, approaching deadlines, bid updates, and status changes.",
  },
  {
    icon: ShieldCheck,
    iconVariant: "purple",
    iconColor: "#7c3aed",
    tag: "Compliance",
    number: "04",
    title: "Audit & Transparency",
    description:
      "Full audit logs and compliance tracking for every action — ensuring accountability at every step.",
  },
  {
    icon: Zap,
    iconVariant: "cyan",
    iconColor: "#0891b2",
    tag: "Performance",
    number: "05",
    title: "Instant Processing",
    description:
      "Lightning-fast bid submissions, document verification, and real-time procurement updates.",
  },
];

export default function CoreFeatures() {
  return (
    <section className="cf-section">
      <div className="cf-inner">
        {/* Header */}
        <div className="cf-header">
          <span className="cf-badge">Platform</span>
          <h2 className="cf-title">
            Built for <span className="cf-title-accent">Modern</span>{" "}
            Procurement
          </h2>
          <p className="cf-subtitle">
            Everything you need to run an efficient, transparent, and
            intelligent tendering process
          </p>
        </div>

        {/* Top row — 2 large cards with stats */}
        <div className="cf-grid">
          {topFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.number} className="cf-card">
                <span className="cf-card-number">{feature.number}</span>
                <span className="cf-tag">{feature.tag}</span>
                <div className={`cf-icon-wrap cf-icon-wrap--${feature.iconVariant}`}>
                  <Icon size={24} color={feature.iconColor} strokeWidth={1.8} />
                </div>
                <h3 className="cf-card-title">{feature.title}</h3>
                <p className="cf-card-desc">{feature.description}</p>
                <div className="cf-stats">
                  {feature.stats.map((stat) => (
                    <div key={stat.label} className="cf-stat">
                      <span className="cf-stat-value">{stat.value}</span>
                      <span className="cf-stat-label">{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom row — 3 compact cards */}
        <div className="cf-grid-bottom">
          {bottomFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.number} className="cf-card">
                <span className="cf-card-number">{feature.number}</span>
                <span className="cf-tag">{feature.tag}</span>
                <div className={`cf-icon-wrap cf-icon-wrap--${feature.iconVariant}`}>
                  <Icon size={24} color={feature.iconColor} strokeWidth={1.8} />
                </div>
                <h3 className="cf-card-title">{feature.title}</h3>
                <p className="cf-card-desc">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="cf-cta-wrap">
          <a href="/features" className="cf-cta">
            View All Features <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
