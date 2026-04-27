"use client";

import { useEffect, useMemo, useState } from "react";
import QaLayout from "@/components/qa/QaLayout";
import QuestionForm from "@/components/qa/QuestionForm";
import QuestionList from "@/components/qa/QuestionList";
import QaAssistantPanel from "@/components/qa/QaAssistantPanel";
import {
  createQaQuestion,
  getQaQuestions,
  type QaCategory,
  type QaQuestion,
} from "@/services/qa.service";

const pageSize = 5;

const categoryOptions: { value: QaCategory | "ALL"; label: string }[] = [
  { value: "ALL", label: "All Categories" },
  { value: "REGISTRATION", label: "Registration" },
  { value: "TENDERS", label: "Tenders" },
  { value: "SUBMISSION", label: "Submission" },
  { value: "PAYMENTS", label: "Payments" },
  { value: "DEADLINES", label: "Deadlines" },
  { value: "OTHER", label: "Other" },
];

const sortOptions = [
  { value: "createdAt,desc", label: "Most Recent" },
  { value: "createdAt,asc", label: "Oldest First" },
  { value: "category,asc", label: "Category" },
];

export default function QaPage() {
  const [questionText, setQuestionText] = useState("");
  const [formCategory, setFormCategory] = useState<QaCategory | "">("");
  const [filterCategory, setFilterCategory] = useState<QaCategory | "ALL">("ALL");
  const [sort, setSort] = useState("createdAt,desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [questions, setQuestions] = useState<QaQuestion[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formMessage, setFormMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const pageIndexes = useMemo(() => {
    return Array.from({ length: Math.min(totalPages, 5) }, (_, index) => index + 1);
  }, [totalPages]);

  async function loadQuestions(page = currentPage) {
    setLoading(true);
    setError(null);
    try {
      const data = await getQaQuestions({
        page: page - 1,
        size: pageSize,
        category: filterCategory,
        sort,
      });
      setQuestions(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
      setExpandedId(null);
    } catch (loadError) {
      console.error("Failed to load Q&A questions:", loadError);
      setQuestions([]);
      setTotalPages(1);
      setTotalElements(0);
      setError("Could not load public questions. Make sure qa-service is running on port 8093.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQuestions(currentPage);
  }, [currentPage, filterCategory, sort]);

  async function handleSubmit() {
    const trimmedQuestion = questionText.trim();
    setFormMessage(null);

    if (!trimmedQuestion || !formCategory) {
      setFormMessage({ type: "error", text: "Please enter a question and select a category." });
      return;
    }

    setSubmitting(true);
    try {
      await createQaQuestion(trimmedQuestion, formCategory);
      setQuestionText("");
      setFormCategory("");
      setFormMessage({ type: "success", text: "Question submitted successfully." });
      setCurrentPage(1);
      await loadQuestions(1);
    } catch (submitError) {
      console.error("Failed to submit Q&A question:", submitError);
      setFormMessage({ type: "error", text: "Could not submit question. Please check qa-service and try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <QaLayout>
      <div className="relative">
        <div className="absolute -left-4 top-0 w-1 h-12 bg-primary rounded-full" />
        <div className="space-y-2 pl-6">
          <h1 className="text-4xl font-black text-black-1 tracking-tight">Questions and Answers</h1>
          <p className="text-gray-2 font-medium">Get answers about using TenderEase.lk.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-8 items-start">
        <div className="space-y-8 min-w-0">
          <QuestionForm
            questionText={questionText}
            category={formCategory}
            submitting={submitting}
            message={formMessage}
            onQuestionChange={setQuestionText}
            onCategoryChange={setFormCategory}
            onSubmit={handleSubmit}
          />

          <section className="space-y-5">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 px-1">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-black-1 uppercase tracking-tight">Public Questions</h2>
                <div className="h-1 w-12 bg-secondary rounded-full" />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={filterCategory}
                  onChange={(event) => {
                    setFilterCategory(event.target.value as QaCategory | "ALL");
                    setCurrentPage(1);
                  }}
                  className="rounded-xl border border-gray-100 bg-white px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-2 outline-none transition-all focus:border-primary/30 focus:ring-2 focus:ring-primary/20"
                >
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <select
                  value={sort}
                  onChange={(event) => {
                    setSort(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="rounded-xl border border-gray-100 bg-white px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-2 outline-none transition-all focus:border-primary/30 focus:ring-2 focus:ring-primary/20"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <QuestionList
              questions={questions}
              loading={loading}
              error={error}
              expandedId={expandedId}
              onToggle={(id) => setExpandedId(expandedId === id ? null : id)}
            />

            <div className="flex flex-col sm:flex-row justify-between items-center gap-6 rounded-[1.5rem] border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-3">
                Showing <span className="text-black-1">{questions.length}</span> of{" "}
                <span className="text-black-1">{totalElements}</span> Questions
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  className="h-10 px-4 rounded-xl border border-gray-100 text-xs font-black text-gray-3 transition-all hover:bg-gray-5 hover:text-black-1 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {pageIndexes.map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`h-10 w-10 rounded-xl border text-xs font-black transition-all ${
                      currentPage === page
                        ? "bg-primary text-white border-primary shadow-primary"
                        : "bg-white text-gray-3 border-gray-100 hover:bg-gray-5 hover:text-black-1"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  className="h-10 px-4 rounded-xl border border-gray-100 text-xs font-black text-gray-3 transition-all hover:bg-gray-5 hover:text-black-1 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </section>
        </div>

        <QaAssistantPanel />
      </div>
    </QaLayout>
  );
}
