"use client";

import { AlertCircle, CheckCircle2, HelpCircle, Loader2, Send } from "lucide-react";
import type { QaCategory } from "@/services/qa.service";

const categories: { value: QaCategory; label: string }[] = [
  { value: "REGISTRATION", label: "Registration" },
  { value: "TENDERS", label: "Tenders" },
  { value: "SUBMISSION", label: "Submission" },
  { value: "PAYMENTS", label: "Payments" },
  { value: "DEADLINES", label: "Deadlines" },
  { value: "OTHER", label: "Other" },
];

interface QuestionFormProps {
  questionText: string;
  category: QaCategory | "";
  submitting: boolean;
  message: { type: "success" | "error"; text: string } | null;
  onQuestionChange: (value: string) => void;
  onCategoryChange: (value: QaCategory | "") => void;
  onSubmit: () => void;
}

export default function QuestionForm({
  questionText,
  category,
  submitting,
  message,
  onQuestionChange,
  onCategoryChange,
  onSubmit,
}: QuestionFormProps) {
  return (
    <section className="bg-white rounded-[2rem] shadow-premium border border-gray-200 p-6 sm:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
          <HelpCircle size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Ask a Question</h2>
          <p className="text-xs font-bold text-gray-500">Questions are public and visible to all users.</p>
        </div>
      </div>

      <textarea
        value={questionText}
        onChange={(event) => onQuestionChange(event.target.value)}
        placeholder="Ask a question about registration, tenders, submissions, payments, or deadlines..."
        className="min-h-36 w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm font-semibold text-gray-900 outline-none transition-all placeholder:text-gray-500 placeholder:font-medium focus:bg-white focus:border-primary/30 focus:ring-2 focus:ring-primary/20"
      />

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
        <select
          value={category}
          onChange={(event) => onCategoryChange(event.target.value as QaCategory | "")}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-900 outline-none transition-all focus:border-primary/30 focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Select Category</option>
          {categories.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3 text-xs font-medium uppercase tracking-wider text-white transition-all hover:bg-primary/90 hover:shadow-primary active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          Submit Question
        </button>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold ${
            message.type === "success"
              ? "bg-success/10 text-success"
              : "bg-error/10 text-error"
          }`}
        >
          {message.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {message.text}
        </div>
      )}
    </section>
  );
}
