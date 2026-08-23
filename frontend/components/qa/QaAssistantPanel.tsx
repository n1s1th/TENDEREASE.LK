"use client";

import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const faqs = [
  {
    question: "How do I register as a vendor?",
    answer: "To register as a vendor, click on 'Sign Up' in the top right corner and select 'Vendor Registration'. Fill out the required details and submit your application for review.",
  },
  {
    question: "What documents are required to submit a bid?",
    answer: "Typically, you'll need your business registration certificate, tax clearance certificates, and any specific technical documents outlined in the tender document. Check the 'Required Documents' section of each tender for specifics.",
  },
  {
    question: "How do I find tenders closing this week?",
    answer: "You can use the advanced search filters on the Tenders page and sort by 'Closing Date (Ascending)' or filter by deadline to find upcoming tender closures.",
  },
  {
    question: "How do I submit a clarification question?",
    answer: "Navigate to the specific tender page and click on 'Submit Clarification'. You can ask any question regarding the tender, and the assigned procurement officer will respond.",
  },
  {
    question: "What is the multi-criteria evaluation process?",
    answer: "Tenders are evaluated based on multiple criteria including financial viability, technical expertise, and past experience. Each tender specifies its evaluation criteria and weightings in the tender document.",
  }
];

export default function QaAssistantPanel() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <Card className="lg:sticky lg:top-32 h-fit flex flex-col">
      <CardHeader className="border-b border-border flex flex-row items-center gap-3">
        <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary/10">
          <HelpCircle className="h-4 w-4 text-primary" />
        </div>
        <div>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Quick Answers</p>
        </div>
      </CardHeader>

      <CardContent className="pt-5 flex flex-col gap-3">
        {faqs.map((faq, index) => (
          <div key={index} className="border border-border rounded-md overflow-hidden bg-card transition-all">
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="flex justify-between items-center w-full p-4 text-left hover:bg-muted/30 transition-colors"
            >
              <span className="text-sm font-semibold text-foreground pr-4">{faq.question}</span>
              {openIndex === index ? (
                <ChevronUp size={16} className="text-primary shrink-0" />
              ) : (
                <ChevronDown size={16} className="text-muted-foreground shrink-0" />
              )}
            </button>
            {openIndex === index && (
              <div className="px-4 pb-4 pt-1 text-sm text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-top-1">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
