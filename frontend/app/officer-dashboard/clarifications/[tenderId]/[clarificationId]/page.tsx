"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft, Calendar, Building2, Tag, Clock,
  MessageSquare, Send, CheckCircle2, User, FileText,
} from "lucide-react";
import type { ClarificationItem } from "@/lib/types/officer-dashboard.types";
import { fetchClarifications, answerClarification } from "@/lib/api/officer-dashboard.api";

// Removed mock data to use real database data

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ClarificationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const tenderId = params.tenderId as string;
  const clarificationId = Number(params.clarificationId);

  const [item, setItem] = useState<ClarificationItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [responseText, setResponseText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const list = await fetchClarifications(tenderId);
        const found = list.find((c) => c.id === clarificationId);
        if (found) {
          setItem(found);
        } else {
          throw new Error("Clarification not found");
        }
      } catch (error) {
        console.error("Failed to load clarification:", error);
        setItem(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [tenderId, clarificationId]);

  async function handleSubmit() {
    if (!responseText.trim() || !item) return;
    setSubmitting(true);
    try {
      const updated = await answerClarification(tenderId, clarificationId, responseText);
      setItem({ ...item, answer: updated.answer ?? responseText, answeredAt: updated.answeredAt ?? new Date().toISOString() });
      setSubmitted(true);
    } catch (error) {
      console.error("Failed to submit response:", error);
      alert("Failed to submit response. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem", color: "var(--te-gray-4)" }}>
        Loading clarification details...
      </div>
    );
  }

  if (!item) {
    return (
      <div style={{ textAlign: "center", padding: "4rem" }}>
        <MessageSquare size={48} style={{ color: "var(--te-gray-4)", marginBottom: "1rem" }} />
        <h3 style={{ color: "var(--te-gray-3)" }}>Clarification not found</h3>
        <button onClick={() => router.back()} style={{ marginTop: "1rem", color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
          ← Go back
        </button>
      </div>
    );
  }

  const isPending = !item.answer;
  const isAnswered = !!item.answer;

  return (
    <div style={{ paddingTop: "0.5rem", maxWidth: 860, margin: "0 auto" }}>
      {/* Back button */}
      <button
        onClick={() => router.push("/officer-dashboard/clarifications")}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--te-gray-4)",
          fontWeight: 600,
          fontSize: "0.85rem",
          padding: "0.5rem 0",
          marginBottom: "1rem",
          transition: "color 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#2563eb")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--te-gray-4)")}
      >
        <ArrowLeft size={16} />
        Back to Clarifications
      </button>

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
        borderRadius: "14px",
        padding: "1.75rem 2rem",
        marginBottom: "1.25rem",
        color: "#fff",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800, margin: 0 }}>
            Clarification Request
          </h1>
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.35rem",
            padding: "0.3rem 0.85rem",
            borderRadius: "20px",
            fontSize: "0.72rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            background: isPending ? "rgba(251,191,36,0.2)" : "rgba(34,197,94,0.2)",
            color: isPending ? "#fbbf24" : "#4ade80",
            border: isPending ? "1px solid rgba(251,191,36,0.3)" : "1px solid rgba(34,197,94,0.3)",
          }}>
            {isPending ? <Clock size={12} /> : <CheckCircle2 size={12} />}
            {isPending ? "Pending Response" : "Answered"}
          </span>
        </div>
        <p style={{ fontSize: "1rem", fontWeight: 600, opacity: 0.9, margin: 0 }}>
          {item.tenderTitle}
        </p>
        <p style={{ fontSize: "0.8rem", opacity: 0.6, marginTop: "0.25rem" }}>
          {item.tenderNumber}
        </p>
      </div>

      {/* Info Cards Row */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "0.75rem",
        marginBottom: "1.25rem",
      }}>
        {[
          { icon: <FileText size={18} />, label: "Tender #", value: item.tenderNumber || "—" },
          { icon: <Building2 size={18} />, label: "Department", value: item.department || "—" },
          { icon: <Calendar size={18} />, label: "Closing Date", value: item.closingDate ? new Date(item.closingDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—" },
          { icon: <Tag size={18} />, label: "Category", value: item.category || "—" },
        ].map((card, i) => (
          <div key={i} style={{
            background: "#fff",
            border: "1px solid var(--te-border, #e2e8f0)",
            borderRadius: "10px",
            padding: "0.9rem 1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: "8px",
              background: "var(--te-gray-7, #f1f5f9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--te-gray-3)",
              flexShrink: 0,
            }}>
              {card.icon}
            </div>
            <div>
              <div style={{ fontSize: "0.68rem", color: "var(--te-gray-4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {card.label}
              </div>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--te-gray-1)", marginTop: "0.15rem" }}>
                {card.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Question Section */}
      <div style={{
        background: "#fff",
        border: "1px solid var(--te-border, #e2e8f0)",
        borderRadius: "12px",
        marginBottom: "1.25rem",
        overflow: "hidden",
      }}>
        <div style={{
          padding: "0.9rem 1.25rem",
          borderBottom: "1px solid var(--te-border, #e2e8f0)",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          background: "var(--te-gray-7, #f8fafc)",
        }}>
          <MessageSquare size={16} style={{ color: "#2563eb" }} />
          <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--te-gray-1)" }}>
            Vendor Question
          </span>
        </div>
        <div style={{ padding: "1.25rem 1.5rem" }}>
          <p style={{
            fontSize: "0.95rem",
            lineHeight: 1.7,
            color: "var(--te-gray-2)",
            margin: 0,
            fontStyle: "italic",
          }}>
            &ldquo;{item.question}&rdquo;
          </p>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginTop: "1rem",
            paddingTop: "0.75rem",
            borderTop: "1px solid var(--te-border, #e2e8f0)",
            fontSize: "0.78rem",
            color: "var(--te-gray-4)",
          }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <User size={13} />
              {item.bidderEmail || "Anonymous"}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <Clock size={13} />
              {formatDate(item.askedAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Answer Section */}
      <div style={{
        background: "#fff",
        border: isAnswered ? "1px solid #bbf7d0" : "1px solid var(--te-border, #e2e8f0)",
        borderRadius: "12px",
        overflow: "hidden",
      }}>
        <div style={{
          padding: "0.9rem 1.25rem",
          borderBottom: "1px solid var(--te-border, #e2e8f0)",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          background: isAnswered ? "#f0fdf4" : "var(--te-gray-7, #f8fafc)",
        }}>
          {isAnswered ? (
            <CheckCircle2 size={16} style={{ color: "#16a34a" }} />
          ) : (
            <Send size={16} style={{ color: "#2563eb" }} />
          )}
          <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--te-gray-1)" }}>
            {isAnswered ? "Official Response" : "Your Response"}
          </span>
        </div>
        <div style={{ padding: "1.25rem 1.5rem" }}>
          {isAnswered ? (
            <>
              <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "var(--te-gray-2)", margin: 0 }}>
                {item.answer}
              </p>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                marginTop: "1rem",
                paddingTop: "0.75rem",
                borderTop: "1px solid var(--te-border, #e2e8f0)",
                fontSize: "0.78rem",
                color: "var(--te-gray-4)",
              }}>
                <CheckCircle2 size={13} />
                Responded on {formatDate(item.answeredAt)}
              </div>
              {submitted && (
                <div style={{
                  marginTop: "1rem",
                  padding: "0.75rem 1rem",
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: "8px",
                  color: "#166534",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                }}>
                  ✓ Response submitted and published. Vendor has been notified.
                </div>
              )}
            </>
          ) : (
            <>
              <textarea
                rows={5}
                placeholder="Type your official response to this clarification question..."
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.875rem 1rem",
                  border: "1px solid var(--te-border, #e2e8f0)",
                  borderRadius: "10px",
                  fontSize: "0.875rem",
                  resize: "vertical",
                  outline: "none",
                  lineHeight: 1.6,
                  fontFamily: "inherit",
                  transition: "border-color 0.2s",
                  minHeight: 120,
                }}
                onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                onBlur={(e) => (e.target.style.borderColor = "var(--te-border, #e2e8f0)")}
              />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
                <p style={{ fontSize: "0.75rem", color: "var(--te-gray-4)", margin: 0 }}>
                  Your response will be published on the tender page and the vendor will be notified via email.
                </p>
                <button
                  onClick={handleSubmit}
                  disabled={!responseText.trim() || submitting}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.7rem 1.5rem",
                    background: responseText.trim() ? "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)" : "#94a3b8",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: responseText.trim() ? "pointer" : "not-allowed",
                    transition: "all 0.2s",
                    boxShadow: responseText.trim() ? "0 4px 14px rgba(37,99,235,0.35)" : "none",
                    flexShrink: 0,
                  }}
                >
                  <Send size={15} />
                  {submitting ? "Submitting..." : "Submit Response"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
