"use client";

import Link from "next/link";
import { useNewsStore } from "@/store";
import { useShallow } from "zustand/shallow";
import { useParams } from "next/navigation";
import Footer from "@/components/home/Footer";
import { ArrowLeft, Calendar, Tag, ShieldCheck } from "lucide-react";

export default function NewsDetailPage() {
  const { id } = useParams();
  const items = useNewsStore(useShallow((s) => s.items));
  const item = items.find((i) => i.id === Number(id));

  if (!item) {
    return (
      <div style={{ background: "#ffffff", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", color: "#111827" }}>
        <h2>Article Not Found</h2>
        <Link href="/news" style={{ color: "#953002", marginTop: "1rem", textDecoration: "none", fontWeight: 600 }}>
          Back to News
        </Link>
      </div>
    );
  }

  // Custom mock description blocks for each seed article to look realistic and professional
  const bodyParagraphs = [
    `We are excited to announce the official release of our updated digital tendering system. Designed to simplify the bid submission workflow, this release streamlines compliance documentation and automated scoring criteria for public sector procurement officials.`,
    `TenderEase's architecture incorporates high-security cryptographic seals to guarantee that no tender submission can be read or modified prior to the exact date and hour of the public bid opening. This matches the legal guidelines defined by the government.`,
    `Moving forward, government agencies can publish requirements within minutes using our standard templates, saving thousands of hours of administrative labor. Vendors will enjoy an equally frictionless digital experience from discovery to final award notifications.`,
  ];

  return (
    <div style={{ background: "#ffffff", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Article Detail */}
      <article style={{ flex: 1, padding: "5rem 1.5rem" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          {/* Back Button */}
          <Link
            href="/news"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "#4b5563",
              textDecoration: "none",
              fontSize: "0.9rem",
              marginBottom: "2.5rem",
              fontWeight: 500,
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#953002")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#4b5563")}
          >
            <ArrowLeft size={16} /> Back to News
          </Link>

          {/* Meta Info */}
          <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.8rem", color: "#6b7280" }}>
              <Calendar size={14} /> {item.date}
            </span>
            <span style={{ color: "#e5e7eb" }}>|</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.8rem", color: "#b84a14", fontWeight: 700, letterSpacing: "0.05em" }}>
              <Tag size={14} /> {item.category}
            </span>
            <span style={{ color: "#e5e7eb" }}>|</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.8rem", color: "#16a34a", fontWeight: 500 }}>
              <ShieldCheck size={14} /> Verified Source
            </span>
          </div>

          {/* Title */}
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#111827", lineHeight: 1.25, margin: "0 0 2rem" }}>
            {item.title}
          </h1>

          {/* Image */}
          <div style={{ borderRadius: 16, overflow: "hidden", marginBottom: "2.5rem", border: "1px solid rgba(149,48,2,0.06)", height: 400 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image}
              alt={item.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* Body Content */}
          <div style={{ color: "#374151", fontSize: "1.05rem", lineHeight: 1.8, display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <p style={{ fontWeight: 600, color: "#111827", fontSize: "1.15rem" }}>
              {bodyParagraphs[0]}
            </p>
            <p>
              {bodyParagraphs[1]}
            </p>
            <p>
              {bodyParagraphs[2]}
            </p>
          </div>
        </div>
      </article>

      {/* Footer */}
      <Footer />
    </div>
  );
}
