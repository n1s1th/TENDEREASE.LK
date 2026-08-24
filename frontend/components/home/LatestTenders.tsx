"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getTenders } from "@/services/tender.service";

// ── Status presentation helpers ─────────────────────────────
type DisplayStatus = "Open" | "Pending" | "Closed" | "Published";

function toDisplayStatus(status: string): DisplayStatus {
  const s = (status || "").toUpperCase();
  if (s === "PUBLISHED" || s === "OPEN") return "Published";
  if (s === "PENDING_APPROVAL" || s === "DRAFT") return "Pending";
  if (s === "CLOSED" || s === "CANCELLED" || s === "AWARDED") return "Closed";
  return "Published";
}

function formatValue(n: number | string | undefined): string {
  const num = Number(n);
  if (!num || isNaN(num)) return "---";
  if (num >= 1_000_000) return `LKR ${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `LKR ${(num / 1_000).toFixed(0)}K`;
  return `LKR ${num}`;
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return "TBA";
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return "TBA";
  }
}

const statusStyle: Record<DisplayStatus, React.CSSProperties> = {
  Published: { background: "#d1fae5", color: "#065f46", border: "1px solid #6ee7b7" },
  Pending: { background: "#ede9fe", color: "#5b21b6", border: "1px solid #c4b5fd" },
  Closed: { background: "#fee2e2", color: "#991b1b", border: "1px solid #fca5a5" },
  Open: { background: "#d1fae5", color: "#065f46", border: "1px solid #6ee7b7" },
};

const actionStyle: Record<DisplayStatus, React.CSSProperties> = {
  Published: { background: "#fff", color: "#953002", border: "1.5px solid #1d4ed8", cursor: "pointer", fontWeight: 600 },
  Open: { background: "#fff", color: "#953002", border: "1.5px solid #1d4ed8", cursor: "pointer", fontWeight: 600 },
  Pending: { background: "#fff", color: "#9ca3af", border: "1.5px solid #d1d5db", cursor: "default", fontWeight: 500 },
  Closed: { background: "#fff", color: "#9ca3af", border: "1.5px solid #d1d5db", cursor: "default", fontWeight: 500 },
};

const actionLabel: Record<DisplayStatus, string> = {
  Published: "View",
  Open: "Bid Now",
  Pending: "Pending",
  Closed: "Closed",
};

export default function LatestTenders() {
  const [tenders, setTenders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLatest() {
      try {
        const data = await getTenders(0, 5);
        if (Array.isArray(data)) {
          setTenders(data);
        } else if (data?.content) {
          setTenders(data.content);
        }
      } catch (err) {
        console.error("Failed to fetch latest tenders:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLatest();
  }, []);

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
            {["Tender Title", "Category", "Department", "Est. Value", "Closing", "Status", "Action"].map((col, i) => (
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

          {/* Loading state */}
          {loading ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "#6b7280" }}>
              Loading latest tenders...
            </div>
          ) : tenders.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "#6b7280" }}>
              No tenders available at the moment.
            </div>
          ) : (
            /* Rows */
            tenders.map((tender, index) => {
              const ds = toDisplayStatus(tender.status);
              const category = tender.procurementType
                ? tender.procurementType.replace(/_/g, " ")
                : "General";
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
                  <span style={{ fontSize: "0.85rem", color: "#374151", textTransform: "capitalize" }}>{category}</span>
                  <span style={{ fontSize: "0.85rem", color: "#374151" }}>{tender.departmentName || "—"}</span>
                  <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#111827", textAlign: "center" }}>
                    {formatValue(tender.estimatedBudget)}
                  </span>
                  <span style={{ fontSize: "0.85rem", color: "#374151", textAlign: "center" }}>
                    {formatDate(tender.closingDate)}
                  </span>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <span style={{ ...statusStyle[ds], padding: "0.25rem 0.75rem", borderRadius: 999, fontSize: "0.78rem", fontWeight: 600, whiteSpace: "nowrap" }}>
                      {ds}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <Link
                      href={`/tenders/${tender.id}`}
                      style={{ ...actionStyle[ds], padding: "0.4rem 1rem", borderRadius: 8, fontSize: "0.82rem", background: "#fff", lineHeight: 1.3, minWidth: 72, transition: "background 0.15s, color 0.15s", textDecoration: "none", textAlign: "center" }}
                    >
                      {actionLabel[ds]}
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
