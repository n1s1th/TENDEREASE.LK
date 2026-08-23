"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, MessageSquare, Clock, CheckCircle2, ChevronRight, Globe, FileText } from "lucide-react";
import type { ClarificationItem } from "@/lib/types/officer-dashboard.types";
import { fetchAllClarifications } from "@/lib/api/officer-dashboard.api";
import { useAuthStore } from "@/store/auth/auth.store";

type TabFilter = "all" | "pending" | "answered";

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export default function ClarificationsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [clarifications, setClarifications] = useState<ClarificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabFilter>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchAllClarifications(user?.email);
        setClarifications(data);
      } catch (error) {
        console.error("Failed to load clarifications:", error);
        setClarifications([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?.email]);

  const isGlobalQuestion = (c: ClarificationItem) => {
    return !c.tenderId || c.tenderId.trim() === "" || c.tenderTitle === "Global" || c.tenderId === "global";
  };

  const filtered = clarifications.filter((c) => {
    const isPending = !c.answer;
    const isGlobal = isGlobalQuestion(c);
    
    if (tab === "pending" && !isPending) return false;
    if (tab === "answered" && isPending) return false;
    
    if (search) {
      const q = search.toLowerCase();
      return (
        c.question.toLowerCase().includes(q) ||
        (c.tenderTitle?.toLowerCase().includes(q) ?? false) ||
        (c.tenderNumber?.toLowerCase().includes(q) ?? false)
      );
    }
    return true;
  });

  const counts = {
    all: clarifications.length,
    pending: clarifications.filter((c) => !c.answer).length,
    answered: clarifications.filter((c) => c.answer).length,
  };

  return (
    <div style={{ paddingTop: "1rem" }}>
      {/* Back Link */}
      <div style={{ marginBottom: "1.5rem" }}>
        <Link 
          href="/officer-dashboard" 
          style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--te-gray-3)", fontSize: "0.95rem", fontWeight: 600, textDecoration: "none", transition: "color 0.2s" }}
          onMouseEnter={(e) => e.currentTarget.style.color = "var(--te-primary)"}
          onMouseLeave={(e) => e.currentTarget.style.color = "var(--te-gray-3)"}
        >
          <span style={{ fontSize: "1.2rem", lineHeight: 1 }}>&larr;</span> Back to Dashboard
        </Link>
      </div>

      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--te-gray-1)", margin: 0 }}>
            Clarification Requests
          </h1>
          <p style={{ color: "var(--te-gray-4)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            Review and respond to vendor questions across all tenders and global queries
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ position: "relative", marginBottom: "1.25rem" }}>
        <Search size={16} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--te-gray-4)" }} />
        <input
          type="text"
          placeholder="Search by tender title, number, or question..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "0.75rem 1rem 0.75rem 2.75rem",
            border: "1px solid var(--te-border, #e2e8f0)",
            borderRadius: "10px",
            fontSize: "0.875rem",
            background: "#fff",
            outline: "none",
            transition: "border-color 0.2s",
          }}
        />
      </div>

      {/* Tab Filter */}
      <div style={{ display: "flex", gap: "0.25rem", marginBottom: "1.5rem", borderBottom: "2px solid var(--te-border, #e2e8f0)", overflowX: "auto" }}>
        {(["all", "pending", "answered"] as TabFilter[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "0.625rem 1.25rem",
              border: "none",
              background: "none",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: tab === t ? 700 : 500,
              color: tab === t ? "#2563eb" : "var(--te-gray-4)",
              borderBottom: tab === t ? "2.5px solid #2563eb" : "2.5px solid transparent",
              marginBottom: "-2px",
              transition: "all 0.2s",
              whiteSpace: "nowrap",
            }}
          >
            {t === "all" ? "All" : 
             t.charAt(0).toUpperCase() + t.slice(1)} ({counts[t]})
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--te-gray-4)" }}>
          Loading clarifications...
        </div>
      )}

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <div style={{
          textAlign: "center",
          padding: "4rem 2rem",
          background: "var(--te-gray-7, #f8fafc)",
          borderRadius: "12px",
          border: "1px dashed var(--te-border, #e2e8f0)",
        }}>
          <MessageSquare size={48} style={{ color: "var(--te-gray-4)", marginBottom: "1rem" }} />
          <h3 style={{ color: "var(--te-gray-3)", fontWeight: 600, marginBottom: "0.5rem" }}>No clarifications found</h3>
          <p style={{ color: "var(--te-gray-4)", fontSize: "0.875rem" }}>
            {search ? "Try a different search term" : "No vendor questions have been submitted yet"}
          </p>
        </div>
      )}

      {/* Clarification Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {filtered.map((c) => {
          const isPending = !c.answer;
          const isGlobal = isGlobalQuestion(c);
          
          return (
            <div
              key={`${c.tenderId || 'global'}-${c.id}`}
              style={{
                background: "#fff",
                border: "1px solid var(--te-border, #e2e8f0)",
                borderRadius: "12px",
                padding: "1.25rem 1.5rem",
                transition: "box-shadow 0.2s, border-color 0.2s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(15,23,42,0.08)";
                e.currentTarget.style.borderColor = "#cbd5e1";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "var(--te-border, #e2e8f0)";
              }}
              onClick={() => {
                if (isGlobal) {
                  // For global QA, we might have a different detail page, or we pass null as tenderId
                  router.push(`/officer-dashboard/clarifications/global/${c.id}`);
                } else {
                  router.push(`/officer-dashboard/clarifications/${c.tenderId}/${c.id}`);
                }
              }}
            >
              {/* Top row: status + tender info */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                  <span style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    padding: "0.2rem 0.75rem",
                    borderRadius: "20px",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    background: isPending ? "#fef3c7" : "#dcfce7",
                    color: isPending ? "#92400e" : "#166534",
                    border: isPending ? "1px solid #fde68a" : "1px solid #bbf7d0",
                  }}>
                    {isPending ? <Clock size={11} /> : <CheckCircle2 size={11} />}
                    {isPending ? "Pending" : "Answered"}
                  </span>
                  
                  {/* Global vs Tender Badge */}
                  <span style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    padding: "0.2rem 0.75rem",
                    borderRadius: "20px",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    background: isGlobal ? "#e0e7ff" : "#f1f5f9",
                    color: isGlobal ? "#3730a3" : "#475569",
                    border: isGlobal ? "1px solid #c7d2fe" : "1px solid #e2e8f0",
                  }}>
                    {isGlobal ? <Globe size={11} /> : <FileText size={11} />}
                    {isGlobal ? "Global Q&A" : "Tender Specific"}
                  </span>

                  {!isGlobal && c.category && c.department && (
                    <span style={{ fontSize: "0.8rem", color: "var(--te-gray-4)", fontWeight: 500 }}>
                      {c.category} / {c.department}
                    </span>
                  )}
                </div>
                <ChevronRight size={18} style={{ color: "var(--te-gray-4)" }} />
              </div>

              {/* Tender title + number */}
              <div style={{ marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--te-gray-1)" }}>
                  {isGlobal ? "General Platform Clarification" : c.tenderTitle}
                </span>
                {!isGlobal && c.tenderNumber && (
                  <span style={{ fontSize: "0.8rem", color: "var(--te-gray-4)", marginLeft: "0.75rem" }}>
                    {c.tenderNumber}
                  </span>
                )}
              </div>

              {/* Question preview */}
              <p style={{
                fontSize: "0.85rem",
                color: "var(--te-gray-3)",
                lineHeight: 1.5,
                marginBottom: "0.75rem",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}>
                &ldquo;{c.question}&rdquo;
              </p>

              {/* Footer: time + action */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.78rem", color: "var(--te-gray-4)" }}>
                  <span>Asked {relativeTime(c.askedAt)}</span>
                  {c.bidderEmail && <span>by {c.bidderEmail}</span>}
                  {c.answeredAt && <span>· Answered {relativeTime(c.answeredAt)}</span>}
                </div>
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: isPending ? "#2563eb" : "#6b7280",
                }}>
                  {isPending ? "View & Respond" : "View Details"}
                  <ChevronRight size={14} />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
