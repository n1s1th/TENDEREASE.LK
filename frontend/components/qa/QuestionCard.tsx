"use client";

import { ChevronDown, Clock, MessageCircle, UserRound } from "lucide-react";
import type { QaQuestion } from "@/services/qa.service";

const categoryLabels: Record<string, string> = {
  REGISTRATION: "Registration",
  TENDERS: "Tenders",
  SUBMISSION: "Submission",
  PAYMENTS: "Payments",
  DEADLINES: "Deadlines",
  OTHER: "Other",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
}

interface QuestionCardProps {
  question: QaQuestion;
  expanded: boolean;
  onToggle: () => void;
}

export default function QuestionCard({ question, expanded, onToggle }: QuestionCardProps) {
  const answered = question.status === "ANSWERED";

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-premium">
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-5 sm:p-6 text-left"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-4 min-w-0">
            <h3 className="text-base sm:text-lg font-black text-black-1 leading-snug">
              {question.questionText}
            </h3>

            <div className="flex flex-wrap items-center gap-3 text-[11px] font-black uppercase tracking-widest text-gray-3">
              <span className="rounded-full bg-secondary/15 px-3 py-1 text-primary">
                {categoryLabels[question.category]}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <UserRound size={13} />
                {question.userId}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock size={13} />
                {formatDate(question.createdAt)}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 ${
                  answered ? "bg-success/10 text-success" : "bg-warning/15 text-[#9b6b00]"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {answered ? `Answered by ${question.answer?.answeredBy || 'Officer'}` : "Pending"}
              </span>
            </div>
          </div>

          <ChevronDown
            size={20}
            className={`mt-1 shrink-0 text-primary transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 bg-[#fffaf0] px-5 py-5 sm:px-6">
          {question.answer ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary">
                <MessageCircle size={15} />
                Official Answer
              </div>
              <p className="text-sm sm:text-base font-medium leading-7 text-gray-1">
                {question.answer.answerText}
              </p>
              <p className="text-[11px] font-black uppercase tracking-widest text-gray-3">
                Answered by {question.answer.answeredBy} on {formatDate(question.answer.createdAt)}
              </p>
            </div>
          ) : (
            <p className="text-sm font-bold text-gray-3">Waiting for official answer.</p>
          )}
        </div>
      )}
    </article>
  );
}
