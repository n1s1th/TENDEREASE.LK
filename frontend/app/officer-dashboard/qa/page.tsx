"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Clock,
  CheckCircle2,
  Send,
  Loader2,
  HelpCircle,
  AlertCircle,
  Search,
  ChevronDown,
} from "lucide-react";
import {
  getOfficerQuestions,
  answerQaQuestion,
  type QaQuestion,
  type QaStatus,
} from "@/services/qa.service";
import { useAuthStore } from "@/store";

type TabFilter = "PENDING" | "ANSWERED";

const categoryLabels: Record<string, string> = {
  REGISTRATION: "Registration",
  TENDERS: "Tenders",
  SUBMISSION: "Submission",
  PAYMENTS: "Payments",
  DEADLINES: "Deadlines",
  OTHER: "Other",
};

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

export default function OfficerQaPage() {
  const [tab, setTab] = useState<TabFilter>("PENDING");
  const [questions, setQuestions] = useState<QaQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const { user } = useAuthStore();

  const pageSize = 10;

  async function loadQuestions(status: TabFilter, page: number) {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await getOfficerQuestions({
        status,
        page: page - 1,
        size: pageSize,
        sort: "createdAt,desc",
      });
      setQuestions(data.content || []);
      setTotalElements(data.totalElements || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Failed to load Q&A questions:", err);
      setQuestions([]);
      setTotalElements(0);
      setTotalPages(1);
      setErrorMsg("Failed to load questions. Ensure qa-service is running on port 8194.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setErrorMsg("You must be logged in as an Officer to view this page.");
      return;
    }
    setCurrentPage(1);
    loadQuestions(tab, 1);
  }, [tab, user]);

  useEffect(() => {
    if (!user) return;
    loadQuestions(tab, currentPage);
  }, [currentPage, user]);

  const filtered = useMemo(() => {
    if (!search.trim()) return questions;
    const q = search.toLowerCase();
    return questions.filter(
      (question) =>
        question.questionText.toLowerCase().includes(q) ||
        categoryLabels[question.category]?.toLowerCase().includes(q) ||
        question.userId.toLowerCase().includes(q)
    );
  }, [questions, search]);

  async function handleAnswer(questionId: number) {
    if (!answerText.trim()) return;
    setSubmitting(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      await answerQaQuestion(questionId, answerText.trim());
      setAnswerText("");
      setExpandedId(null);
      setSuccessMsg("Answer submitted successfully! The question has been moved to Answered.");
      // Reload current tab
      await loadQuestions(tab, currentPage);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error("Failed to answer question:", err);
      setErrorMsg(err?.message || "Failed to submit answer.");
    } finally {
      setSubmitting(false);
    }
  }

  const pendingCount = tab === "PENDING" ? totalElements : 0;
  const answeredCount = tab === "ANSWERED" ? totalElements : 0;

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
          <div style={{ width: 4, height: 50, background: "#953002", borderRadius: 4, marginTop: "0.2rem" }} />
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--te-gray-1, #1e293b)", margin: 0 }}>
              Global Q&A Management
            </h1>
            <p style={{ color: "var(--te-gray-4, #94a3b8)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
              Review and answer public platform questions from all users
            </p>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMsg && (
        <div style={{
          display: "flex", alignItems: "center", gap: "0.5rem",
          background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10,
          padding: "0.75rem 1rem", marginBottom: "1rem",
          fontSize: "0.875rem", fontWeight: 600, color: "#166534",
        }}>
          <CheckCircle2 size={16} />
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div style={{
          display: "flex", alignItems: "center", gap: "0.5rem",
          background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10,
          padding: "0.75rem 1rem", marginBottom: "1rem",
          fontSize: "0.875rem", fontWeight: 600, color: "#991b1b",
        }}>
          <AlertCircle size={16} />
          {errorMsg}
        </div>
      )}

      {/* Search Bar */}
      <div style={{ position: "relative", marginBottom: "1.25rem" }}>
        <Search size={16} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--te-gray-4, #94a3b8)" }} />
        <input
          type="text"
          placeholder="Search questions by text, category, or user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "0.75rem 1rem 0.75rem 2.75rem",
            border: "1px solid var(--te-border, #e2e8f0)",
            borderRadius: 10,
            fontSize: "0.875rem",
            background: "#fff",
            outline: "none",
            transition: "border-color 0.2s",
          }}
        />
      </div>

      {/* Tab Filter */}
      <div style={{ display: "flex", gap: "0.25rem", marginBottom: "1.5rem", borderBottom: "2px solid var(--te-border, #e2e8f0)" }}>
        <button
          onClick={() => setTab("PENDING")}
          style={{
            display: "flex", alignItems: "center", gap: "0.4rem",
            padding: "0.625rem 1.25rem",
            border: "none", background: "none", cursor: "pointer",
            fontSize: "0.875rem",
            fontWeight: tab === "PENDING" ? 700 : 500,
            color: tab === "PENDING" ? "#953002" : "var(--te-gray-4, #94a3b8)",
            borderBottom: tab === "PENDING" ? "2.5px solid #953002" : "2.5px solid transparent",
            marginBottom: "-2px", transition: "all 0.2s",
          }}
        >
          <Clock size={14} />
          Pending
        </button>
        <button
          onClick={() => setTab("ANSWERED")}
          style={{
            display: "flex", alignItems: "center", gap: "0.4rem",
            padding: "0.625rem 1.25rem",
            border: "none", background: "none", cursor: "pointer",
            fontSize: "0.875rem",
            fontWeight: tab === "ANSWERED" ? 700 : 500,
            color: tab === "ANSWERED" ? "#166534" : "var(--te-gray-4, #94a3b8)",
            borderBottom: tab === "ANSWERED" ? "2.5px solid #166534" : "2.5px solid transparent",
            marginBottom: "-2px", transition: "all 0.2s",
          }}
        >
          <CheckCircle2 size={14} />
          Answered
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "4rem", color: "var(--te-gray-4, #94a3b8)" }}>
          <Loader2 size={32} style={{ animation: "spin 1s linear infinite", margin: "0 auto 1rem" }} />
          <p style={{ fontSize: "0.875rem", fontWeight: 600 }}>Loading questions...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <div style={{
          textAlign: "center", padding: "4rem 2rem",
          background: "var(--te-gray-7, #f8fafc)", borderRadius: 12,
          border: "1px dashed var(--te-border, #e2e8f0)",
        }}>
          <HelpCircle size={48} style={{ color: "var(--te-gray-4, #94a3b8)", marginBottom: "1rem" }} />
          <h3 style={{ color: "var(--te-gray-3, #64748b)", fontWeight: 600, marginBottom: "0.5rem" }}>
            {tab === "PENDING" ? "No pending questions" : "No answered questions yet"}
          </h3>
          <p style={{ color: "var(--te-gray-4, #94a3b8)", fontSize: "0.875rem" }}>
            {tab === "PENDING"
              ? "All public questions have been answered. Great work!"
              : "Questions will appear here once they are answered."}
          </p>
        </div>
      )}

      {/* Question Cards */}
      {!loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {filtered.map((q) => {
            const isExpanded = expandedId === q.id;
            return (
              <div
                key={q.id}
                style={{
                  background: "#fff",
                  border: "1px solid var(--te-border, #e2e8f0)",
                  borderRadius: 12,
                  overflow: "hidden",
                  transition: "box-shadow 0.2s, border-color 0.2s",
                }}
              >
                {/* Card Header */}
                <button
                  type="button"
                  onClick={() => {
                    setExpandedId(isExpanded ? null : q.id);
                    setAnswerText("");
                  }}
                  style={{
                    width: "100%", padding: "1.25rem 1.5rem",
                    border: "none", background: "transparent", cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Status + Category row */}
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: "0.25rem",
                          padding: "0.15rem 0.6rem", borderRadius: 20,
                          fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px",
                          background: q.status === "PENDING" ? "#fef3c7" : "#dcfce7",
                          color: q.status === "PENDING" ? "#92400e" : "#166534",
                          border: q.status === "PENDING" ? "1px solid #fde68a" : "1px solid #bbf7d0",
                        }}>
                          {q.status === "PENDING" ? <Clock size={10} /> : <CheckCircle2 size={10} />}
                          {q.status}
                        </span>
                        <span style={{
                          display: "inline-flex", alignItems: "center",
                          padding: "0.15rem 0.6rem", borderRadius: 20,
                          fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px",
                          background: "#fff7ed", color: "#953002", border: "1px solid #fed7aa",
                        }}>
                          {categoryLabels[q.category] || q.category}
                        </span>
                      </div>

                      {/* Question text */}
                      <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--te-gray-1, #1e293b)", margin: "0 0 0.4rem", lineHeight: 1.4 }}>
                        {q.questionText}
                      </h3>

                      {/* Meta */}
                      <div style={{ display: "flex", gap: "1.25rem", fontSize: "0.78rem", color: "var(--te-gray-4, #94a3b8)" }}>
                        <span>By {q.userId === "anonymous" ? "Anonymous User" : q.userId}</span>
                        <span>{relativeTime(q.createdAt)}</span>
                      </div>
                    </div>

                    <ChevronDown
                      size={18}
                      style={{
                        color: "#953002", marginTop: 4, flexShrink: 0,
                        transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s",
                      }}
                    />
                  </div>
                </button>

                {/* Expanded: Answer Form (Pending) or Answer Display (Answered) */}
                {isExpanded && (
                  <div style={{
                    borderTop: "1px solid var(--te-border, #e2e8f0)",
                    padding: "1.25rem 1.5rem",
                    background: tab === "ANSWERED" ? "#f0fdf4" : "#fffbf0",
                  }}>
                    {q.status === "ANSWERED" && q.answer ? (
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.5rem", fontSize: "0.75rem", fontWeight: 700, color: "#166534", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          <MessageSquare size={14} />
                          Official Answer
                        </div>
                        <p style={{ fontSize: "0.9rem", fontWeight: 500, lineHeight: 1.6, color: "var(--te-gray-2, #334155)", margin: "0 0 0.5rem" }}>
                          {q.answer.answerText}
                        </p>
                        <p style={{ fontSize: "0.75rem", color: "var(--te-gray-4, #94a3b8)", fontWeight: 600 }}>
                          Answered by {q.answer.answeredBy} · {relativeTime(q.answer.createdAt)}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.75rem", fontSize: "0.75rem", fontWeight: 700, color: "#953002", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          <Send size={14} />
                          Write Your Answer
                        </div>
                        <textarea
                          value={answerText}
                          onChange={(e) => setAnswerText(e.target.value)}
                          placeholder="Type your official answer here..."
                          rows={4}
                          style={{
                            width: "100%", padding: "0.75rem 1rem",
                            border: "1px solid var(--te-border, #e2e8f0)",
                            borderRadius: 10, fontSize: "0.875rem",
                            resize: "vertical", outline: "none",
                            transition: "border-color 0.2s",
                            fontFamily: "inherit",
                          }}
                        />
                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.75rem" }}>
                          <button
                            onClick={() => handleAnswer(q.id)}
                            disabled={submitting || !answerText.trim()}
                            style={{
                              display: "inline-flex", alignItems: "center", gap: "0.4rem",
                              padding: "0.6rem 1.5rem", borderRadius: 8,
                              border: "none", cursor: submitting || !answerText.trim() ? "not-allowed" : "pointer",
                              background: submitting || !answerText.trim() ? "#d1d5db" : "#953002",
                              color: "#fff", fontSize: "0.8rem", fontWeight: 700,
                              transition: "background 0.2s",
                            }}
                          >
                            {submitting ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={14} />}
                            {submitting ? "Submitting..." : "Submit Answer"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div style={{
          display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem",
          marginTop: "1.5rem", paddingTop: "1rem",
        }}>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            style={{
              padding: "0.5rem 1rem", borderRadius: 8,
              border: "1px solid var(--te-border, #e2e8f0)",
              background: "#fff", cursor: currentPage === 1 ? "not-allowed" : "pointer",
              fontSize: "0.8rem", fontWeight: 600,
              opacity: currentPage === 1 ? 0.4 : 1,
            }}
          >
            Previous
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              style={{
                width: 36, height: 36, borderRadius: 8,
                border: currentPage === page ? "1px solid #953002" : "1px solid var(--te-border, #e2e8f0)",
                background: currentPage === page ? "#953002" : "#fff",
                color: currentPage === page ? "#fff" : "var(--te-gray-3, #64748b)",
                cursor: "pointer", fontSize: "0.8rem", fontWeight: 700,
              }}
            >
              {page}
            </button>
          ))}
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            style={{
              padding: "0.5rem 1rem", borderRadius: 8,
              border: "1px solid var(--te-border, #e2e8f0)",
              background: "#fff", cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
              fontSize: "0.8rem", fontWeight: 600,
              opacity: currentPage >= totalPages ? 0.4 : 1,
            }}
          >
            Next
          </button>
        </div>
      )}

      {/* CSS for spin animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
