"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import type { QaQuestion } from "@/services/qa.service";
import QuestionCard from "@/components/qa/QuestionCard";

interface QuestionListProps {
  questions: QaQuestion[];
  loading: boolean;
  error: string | null;
  expandedId: number | null;
  onToggle: (id: number) => void;
}

export default function QuestionList({
  questions,
  loading,
  error,
  expandedId,
  onToggle,
}: QuestionListProps) {
  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-4 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
        <Loader2 size={36} className="animate-spin text-primary" />
        <p className="text-xs font-black text-gray-3 uppercase tracking-[0.2em]">Loading Questions</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-3 bg-white rounded-[2rem] border border-error/20 text-center">
        <AlertCircle size={34} className="text-error" />
        <p className="text-sm font-black text-error">{error}</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 bg-white rounded-[2rem] border border-gray-100 text-center shadow-sm">
        <p className="text-lg font-black text-black-1">No public questions yet</p>
        <p className="text-sm font-bold text-gray-3">Ask the first general platform question above.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((question) => (
        <QuestionCard
          key={question.id}
          question={question}
          expanded={expandedId === question.id}
          onToggle={() => onToggle(question.id)}
        />
      ))}
    </div>
  );
}
