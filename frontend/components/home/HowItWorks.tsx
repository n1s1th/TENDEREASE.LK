"use client";

import { FileText, UserCheck, MessageSquare, Award } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: FileText,
    title: "Publish Tender",
    description:
      "Departments create and publish tenders with structured details, requirements, and deadlines.",
  },
  {
    number: "02",
    icon: UserCheck,
    title: "Vendor Registration",
    description:
      "Vendors register, complete KYC verification, and gain access to relevant opportunities.",
  },
  {
    number: "03",
    icon: MessageSquare,
    title: "Engage & Submit",
    description:
      "Ask clarification questions, receive updates, and submit bids securely through the platform.",
  },
  {
    number: "04",
    icon: Award,
    title: "Evaluate & Award",
    description:
      "Transparent evaluation, structured scoring, and a clear final decision with full audit trail.",
  },
];

export default function HowItWorks() {
  return (
    <section style={{ background: "#fff", padding: "5rem 1.5rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Section header */}
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <p style={{
            fontSize: "0.8rem",
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#953002",
            marginBottom: "0.5rem",
          }}>
            Process
          </p>
          <h2 style={{
            fontSize: "clamp(1.6rem, 3vw, 2.25rem)",
            fontWeight: 800,
            color: "#111827",
            margin: "0 0 0.75rem",
          }}>
            How TenderHub Works
          </h2>
          <p style={{
            fontSize: "1rem",
            color: "#6b7280",
            maxWidth: 520,
            margin: "0 auto",
            lineHeight: 1.7,
          }}>
            A simple, transparent procurement process from start to finish
          </p>
        </div>

        {/* Steps grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1.5rem",
          position: "relative",
        }}>
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.number} style={{ position: "relative" }}>
                {/* Connector arrow between cards */}
                {index < steps.length - 1 && (
                  <div style={{
                    position: "absolute",
                    right: "-0.85rem",
                    top: "2.75rem",
                    zIndex: 1,
                    color: "#d1d5db",
                    fontSize: "1.4rem",
                    fontWeight: 300,
                    lineHeight: 1,
                  }}>
                    →
                  </div>
                )}

                {/* Card */}
                <div
                  style={{
                    background: "#f9fafb",
                    border: "1.5px solid #f0f0f0",
                    borderRadius: 16,
                    padding: "2rem 1.5rem 1.75rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                    height: "100%",
                    transition: "box-shadow 0.2s, border-color 0.2s",
                    cursor: "default",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 28px rgba(149,48,2,0.1)";
                    (e.currentTarget as HTMLDivElement).style.borderColor = "#fca5a5";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                    (e.currentTarget as HTMLDivElement).style.borderColor = "#f0f0f0";
                  }}
                >
                  {/* Step number + icon row */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{
                      fontSize: "2rem",
                      fontWeight: 900,
                      color: "#f3f4f6",
                      lineHeight: 1,
                      letterSpacing: "-1px",
                    }}>
                      {step.number}
                    </span>
                    <div style={{
                      width: 46,
                      height: 46,
                      borderRadius: 12,
                      background: "#fff1f1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <Icon size={22} color="#953002" strokeWidth={1.8} />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "#111827",
                    margin: 0,
                  }}>
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p style={{
                    fontSize: "0.875rem",
                    color: "#6b7280",
                    lineHeight: 1.65,
                    margin: 0,
                  }}>
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", marginTop: "3rem" }}>
          <a
            href="/how-it-works"
            style={{
              display: "inline-block",
              padding: "0.75rem 2rem",
              background: "#953002",
              color: "#fff",
              borderRadius: 8,
              fontSize: "0.9rem",
              fontWeight: 600,
              textDecoration: "none",
              transition: "background 0.15s, transform 0.1s",
              boxShadow: "0 4px 14px rgba(149,48,2,0.25)",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.background = "#7f1d1d";
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.background = "#953002";
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
            }}
          >
            Explore Workflow →
          </a>
        </div>
      </div>
    </section>
  );
}
