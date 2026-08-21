"use client";

import { FileText, UserCheck, MessageSquare, Award, ArrowRight } from "lucide-react";
import { usePathname } from "next/navigation";

const steps = [
  {
    number: "01",
    icon: FileText,
    title: "Publish Tender",
    description:
      "Departments create and publish tenders with structured details, requirements, and deadlines.",
  },
  {
    number: "02",
    icon: UserCheck,
    title: "Vendor Registration",
    description:
      "Vendors register, complete KYC verification, and gain access to relevant opportunities.",
  },
  {
    number: "03",
    icon: MessageSquare,
    title: "Engage & Submit",
    description:
      "Ask clarification questions, receive updates, and submit bids securely through the platform.",
  },
  {
    number: "04",
    icon: Award,
    title: "Evaluate & Award",
    description:
      "Transparent evaluation, structured scoring, and a clear final decision with full audit trail.",
  },
];

export default function HowItWorks() {
  const pathname = usePathname();
  const isHowItWorksPage = pathname === "/how-it-works";

  return (
    <section className="hiw-section">
      <div className="hiw-inner">
        {/* Header */}
        <div className="hiw-header">
          <span className="hiw-badge">Process</span>
          <h2 className="hiw-title">How TenderHub Works</h2>
          <p className="hiw-subtitle">
            A simple, transparent procurement process from start to finish
          </p>
        </div>

        {/* Timeline */}
        <div className="hiw-timeline">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="hiw-step">
                {/* Card */}
                <div className="hiw-card">
                  <div className="hiw-card-icon">
                    <Icon size={22} color="#953002" strokeWidth={1.8} />
                  </div>
                  <h3 className="hiw-card-title">{step.title}</h3>
                  <p className="hiw-card-desc">{step.description}</p>
                </div>

                {/* Center indicator */}
                <div className="hiw-indicator">{step.number}</div>

                {/* Spacer for opposite side */}
                <div className="hiw-spacer" />
              </div>
            );
          })}
        </div>

        {/* CTA */}
        {!isHowItWorksPage && (
          <div className="hiw-cta-wrap">
            <a href="/how-it-works" className="hiw-cta">
              Explore Workflow <ArrowRight size={16} />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
