"use client";

import { useState } from "react";
import {
  AlertCircle,
  Send,
  Loader2,
  Info,
} from "lucide-react";
import { submitClarification } from "@/services/tender.service";

export default function ClarificationsTab({
  clarifications = [],
  tenderId,
}: any) {
  const [showForm, setShowForm] = useState(false);
  const [question, setQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  console.log("Tender ID:", tenderId); // ✅ now correct

  const [localClarifications, setLocalClarifications] =
    useState<any[]>(clarifications);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    if (!tenderId) {
      console.error("Tender ID missing");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");

    // Optimistic UI
    setLocalClarifications([
      ...localClarifications,
      {
        id: Math.floor(Math.random() * 10000),
        question,
        answer: null,
        askedAt: new Date().toISOString(),
      },
    ]);

    const cachedQuestion = question;
    setQuestion("");
    setTimeout(() => setShowForm(false), 1000);

    try {
      await submitClarification(tenderId, cachedQuestion);
      setSubmitStatus("success");
    } catch (error) {
      console.error("Backend failed:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasClarifications = localClarifications.length > 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black">
            Clarifications & Inquiries
          </h2>
          <p className="text-sm text-gray-500">
            Official responses to vendor queries.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className={`px-6 py-2 rounded-xl font-bold ${
            showForm ? "bg-gray-200" : "bg-black text-white"
          }`}
        >
          {showForm ? "Cancel" : "Submit Question"}
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 border p-4 rounded-xl"
        >
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full p-3 border rounded"
            placeholder="Type your question..."
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-black text-white px-4 py-2 rounded flex items-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
            Submit
          </button>
        </form>
      )}

      {/* LIST */}
      {!hasClarifications ? (
        <div className="text-center py-10">
          <AlertCircle size={32} />
          <p>No clarifications yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {localClarifications.map((c: any, index: number) => (
            <div key={index} className="border p-4 rounded-xl">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-bold">
                  Ticket Q-{c.id}
                </span>

                <span
                  className={`text-xs ${
                    c.answer
                      ? "text-green-600"
                      : "text-orange-600"
                  }`}
                >
                  {c.answer ? "Resolved" : "Pending"}
                </span>
              </div>

              <p className="font-semibold">{c.question}</p>

              {c.answer ? (
                <p className="mt-2 text-gray-600">
                  {c.answer}
                </p>
              ) : (
                <p className="mt-2 text-gray-400 italic">
                  Awaiting response...
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* NOTICE */}
      <div className="bg-yellow-50 border p-4 rounded-xl flex gap-2">
        <Info size={18} />
        <p className="text-sm">
          Submit before deadline. Responses are official.
        </p>
      </div>
    </div>
  );
}