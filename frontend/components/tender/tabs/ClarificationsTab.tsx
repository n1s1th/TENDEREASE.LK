"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  Send,
  Loader2,
  Info,
  MessageSquare,
} from "lucide-react";
import { submitClarification } from "@/services/tender.service";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

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

  const [localClarifications, setLocalClarifications] =
    useState<any[]>(clarifications);

  useEffect(() => {
    setLocalClarifications(clarifications);
  }, [clarifications]);

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
    <div className="space-y-6">
      <Card>
        <CardHeader className="border-b border-border flex flex-row items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary/10">
              <MessageSquare className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle>Clarifications & Inquiries</CardTitle>
            </div>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            variant={showForm ? "outline" : "default"}
            size="sm"
          >
            {showForm ? "Cancel" : "Submit Question"}
          </Button>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* FORM */}
          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="space-y-4 border border-border p-5 rounded-md bg-grey-1"
            >
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Type your question here..."
                className="min-h-[100px] bg-white"
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting || !question.trim()}
                  size="sm"
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Submit
                </Button>
              </div>
            </form>
          )}

          {/* LIST */}
          {!hasClarifications ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="h-12 w-12 rounded-full bg-grey-1 flex items-center justify-center mb-4 text-muted-foreground">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1">No Clarifications Yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                No questions have been submitted for this tender.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {localClarifications.map((c: any, index: number) => (
                <div key={index} className="border border-border p-5 rounded-md bg-white hover:border-primary/20 transition-colors">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold bg-grey-1 px-2 py-0.5 rounded uppercase tracking-wider text-muted-foreground">
                      Ticket Q-{c.id}
                    </span>

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        c.answer
                          ? "bg-success/10 text-success border border-success/20"
                          : "bg-warning/10 text-warning border border-warning/20"
                      }`}
                    >
                      {c.answer ? "Resolved" : "Pending"}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-foreground">{c.question}</p>

                  {c.answer ? (
                    <div className="mt-3 bg-grey-1 p-3 rounded text-sm text-muted-foreground border-l-2 border-primary">
                      {c.answer}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-muted-foreground italic">
                      Awaiting response...
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* NOTICE */}
      <Card>
        <CardContent className="p-4 flex items-center gap-3 bg-warning/5 border border-warning/10">
          <Info className="text-warning shrink-0" size={20} />
          <p className="text-sm font-medium text-warning/90">
            <span className="font-semibold">Important:</span> Submit your questions before the clarification deadline. All responses are official.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
