"use client";

import Link from "next/link";
import { useTenderStore } from "@/store";

// ── Status presentation helpers (UI-only, stay in component) ─
type DisplayStatus = "Open" | "Pending" | "Closed";

function toDisplayStatus(status: string): DisplayStatus {
  if (status === "open") return "Open";
  if (status === "pending") return "Pending";
  return "Closed";
}

function formatValue(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

const statusStyle: Record<DisplayStatus, React.CSSProperties> = {
  Open: { background: "#d1fae5", color: "#065f46", border: "1px solid #6ee7b7" },
  Pending: { background: "#ede9fe", color: "#5b21b6", border: "1px solid #c4b5fd" },
  Closed: { background: "#fee2e2", color: "#991b1b", border: "1px solid #fca5a5" },
};

const actionStyle: Record<DisplayStatus, React.CSSProperties> = {
  Open: { background: "#fff", color: "#953002", border: "1.5px solid #1d4ed8", cursor: "pointer", fontWeight: 600 },
  Pending: { background: "#fff", color: "#9ca3af", border: "1.5px solid #d1d5db", cursor: "default", fontWeight: 500 },
  Closed: { background: "#fff", color: "#9ca3af", border: "1.5px solid #d1d5db", cursor: "default", fontWeight: 500 },
};

const actionLabel: Record<DisplayStatus, string> = {
  Open: "Bid Now",
  Pending: "Pending",
  Closed: "Closed",
};

export default function LatestTenders() {
  // ── Consume store — no local dummy data ───────────────────
  const tenders = useTenderStore((s) => s.tenders);

  return (
    <section style={{ background: "#fff8f4", padding: "3.5rem 1.5rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.75rem",
          }}
        >
          <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#111827", margin: 0 }}>
            Latest Tenders
          </h2>
          <Link
            href="/tenders"
            style={{ color: "#953002", fontWeight: 600, fontSize: "0.9rem", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.25rem" }}
          >
            View All Tenders →
          </Link>
        </div>

        {/* Table card */}
        <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          {/* Table header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2.5fr 1.3fr 1.3fr 0.9fr 1.1fr 0.9fr 0.9fr",
              padding: "0.875rem 1.5rem",
              background: "#fffcfb",
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            {["Tender Title", "Category", "Issuer", "Est. Value", "Deadline", "Status", "Action"].map((col, i) => (
              <span
                key={col}
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: "#6b7280",
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  textAlign: i >= 3 ? "center" : "left",
                }}
              >
                {col === "Est. Value" ? (<>Est.<br />Value</>) : col}
              </span>
            ))}
          </div>

          {/* Rows */}
          {tenders.map((tender, index) => {
            const ds = toDisplayStatus(tender.status);
            return (
              <div
                key={tender.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2.5fr 1.3fr 1.3fr 0.9fr 1.1fr 0.9fr 0.9fr",
                  padding: "1.1rem 1.5rem",
                  alignItems: "center",
                  background: index % 2 === 1 ? "#fffafa" : "#fff",
                  borderBottom: index < tenders.length - 1 ? "1px solid #f0f0f0" : "none",
                  transition: "background 0.15s",
                }}
              >
                <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "#111827", lineHeight: 1.45 }}>
                  {tender.title}
                </span>
                <span style={{ fontSize: "0.85rem", color: "#374151" }}>{tender.category}</span>
                <span style={{ fontSize: "0.85rem", color: "#374151" }}>{tender.issuer}</span>
                <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#111827", textAlign: "center" }}>
                  {formatValue(tender.estimatedValue)}
                </span>
                <span style={{ fontSize: "0.85rem", color: "#374151", textAlign: "center" }}>
                  {tender.deadline}
                </span>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <span style={{ ...statusStyle[ds], padding: "0.25rem 0.75rem", borderRadius: 999, fontSize: "0.78rem", fontWeight: 600, whiteSpace: "nowrap" }}>
                    {ds}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <button
                    disabled={tender.status !== "open"}
                    style={{ ...actionStyle[ds], padding: "0.4rem 1rem", borderRadius: 8, fontSize: "0.82rem", background: "#fff", lineHeight: 1.3, minWidth: 72, transition: "background 0.15s, color 0.15s" }}
                  >
                    {actionLabel[ds]}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
