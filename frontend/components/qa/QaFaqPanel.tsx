"use client";

import { useMemo, useState } from "react";
import { ChevronDown, HelpCircle, Search } from "lucide-react";

interface Faq {
  category: string;
  question: string;
  answer: string;
}

/**
 * Common questions answered up front, so people can self-serve instead of
 * waiting for an officer to reply in the public Q&A list.
 */
const FAQS: Faq[] = [
  {
    category: "Registration",
    question: "How do I register as a vendor?",
    answer:
      "Choose Register from the top of the page and complete the vendor form. You will need your Business Registration certificate, tax details and a contact email. Registration is reviewed by an officer, and you will be notified once your account is approved.",
  },
  {
    category: "Registration",
    question: "Is there a fee to register?",
    answer:
      "Creating an account is free. Individual tenders may charge a separate bidding or document fee, which is always stated on the tender's detail page before you apply.",
  },
  {
    category: "Registration",
    question: "My registration is still pending. What happens next?",
    answer:
      "An officer reviews each application. You can keep using the site to browse tenders while you wait, and you will receive an email as soon as the review is complete. If more than a few working days pass, contact support@tenderease.lk.",
  },
  {
    category: "Tenders",
    question: "How do I find tenders that are still open?",
    answer:
      "The Tenders page opens on the Open Tenders tab, which lists everything still accepting bids. Use the search box and the category, status and date filters to narrow the list further.",
  },
  {
    category: "Tenders",
    question: "Why can't I see the full details of a tender?",
    answer:
      "Tender details, documents and contact information are available to signed-in users. Log in or register, and you will be returned to the tender you were viewing.",
  },
  {
    category: "Tenders",
    question: "How do I save a tender to come back to it?",
    answer:
      "Open the tender and use the bookmark button in the header, or Save for Later at the bottom of the page. Saved tenders appear under the Saved Tenders tab on the Tenders page and stay there across sessions.",
  },
  {
    category: "Submission",
    question: "What documents do I need to submit a bid?",
    answer:
      "Most tenders require the completed Standard Bidding Document, your Business Registration certificate and a valid tax clearance certificate. Each tender lists its own requirements on the Documents tab, so check there before you start.",
  },
  {
    category: "Submission",
    question: "Can I change my bid after submitting it?",
    answer:
      "A submitted bid cannot be edited. If the tender is still open and you need to correct something, contact the procurement officer listed on the tender's Contact tab as early as possible.",
  },
  {
    category: "Submission",
    question: "What file formats are accepted?",
    answer:
      "Upload documents as PDF, DOC or DOCX, up to 20 MB per file. Scanned documents are fine as long as the text is legible.",
  },
  {
    category: "Deadlines",
    question: "What happens when a tender closes?",
    answer:
      "The tender stops accepting bids at the closing date and time shown on its page, and moves to the Closed Tenders tab. Late submissions cannot be accepted, so allow time for uploads to finish.",
  },
  {
    category: "Deadlines",
    question: "How will I know if a deadline changes?",
    answer:
      "Changes are published as an addendum on the tender's Addenda tab, and the revised closing date is reflected on the tender header. The Timeline tab shows when each change was issued.",
  },
  {
    category: "Clarifications",
    question: "How do I ask a question about a specific tender?",
    answer:
      "Open the tender and use the Clarifications tab. Questions there go to the procurement officer responsible for that tender, and the official reply is published on the same tab for all bidders to see.",
  },
  {
    category: "Clarifications",
    question: "How is this different from the public Q&A on this page?",
    answer:
      "This page is for general questions about using TenderEase.lk. Anything specific to one tender — its scope, requirements or deadlines — belongs on that tender's Clarifications tab so the answer reaches every bidder.",
  },
];

export default function QaFaqPanel() {
  const [query, setQuery] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return FAQS;
    return FAQS.filter(
      (faq) =>
        faq.question.toLowerCase().includes(term) ||
        faq.answer.toLowerCase().includes(term) ||
        faq.category.toLowerCase().includes(term)
    );
  }, [query]);

  return (
    <aside className="lg:sticky lg:top-32 h-fit overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-gray-200 px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <HelpCircle size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Common Questions</h2>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Answers to what people ask most
          </p>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpenIndex(null);
            }}
            placeholder="Search questions…"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm font-normal text-gray-700 outline-none transition-all placeholder:text-gray-400 focus:border-primary/30 focus:bg-white focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {results.length === 0 ? (
          <p className="px-1 py-6 text-center text-sm font-normal leading-relaxed text-gray-500">
            No matching question. Try a different wording, or ask below and an officer will answer.
          </p>
        ) : (
          <div className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
            {results.map((faq, index) => {
              const isOpen = openIndex === index;

              return (
                <div
                  key={faq.question}
                  className="overflow-hidden rounded-xl border border-gray-200 transition-colors hover:border-gray-300"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left"
                  >
                    <span className="min-w-0 space-y-1">
                      <span className="block text-xs font-medium uppercase tracking-wider text-gray-500">
                        {faq.category}
                      </span>
                      <span className="block text-sm font-semibold leading-snug text-gray-900">
                        {faq.question}
                      </span>
                    </span>
                    <ChevronDown
                      size={16}
                      className={`mt-1 shrink-0 text-gray-400 transition-transform ${
                        isOpen ? "rotate-180 text-primary" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <p className="border-t border-gray-200 bg-gray-50 px-4 py-3 text-sm font-normal leading-relaxed text-gray-600">
                      {faq.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <p className="border-t border-gray-200 pt-4 text-xs font-normal leading-relaxed text-gray-500">
          Still stuck? Ask your question on the left and a procurement officer will respond, or
          email{" "}
          <a href="mailto:support@tenderease.lk" className="font-medium text-primary hover:underline">
            support@tenderease.lk
          </a>
          .
        </p>
      </div>
    </aside>
  );
}
