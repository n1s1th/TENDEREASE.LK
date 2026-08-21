"use client";

import {
  UserCheck,
  Lock,
  Scale,
  Fingerprint,
  ArrowRight,
} from "lucide-react";

const pillars = [
  {
    id: "verified-onboarding",
    icon: UserCheck,
    iconVariant: "brand",
    iconColor: "#953002",
    tag: "KYC Verification",
    title: "Verified Onboarding",
    description:
      "All registered vendors undergo rigorous identity and business registry verification before joining, ensuring a pool of legitimate partners.",
  },
  {
    id: "encrypted-vaults",
    icon: Lock,
    iconVariant: "amber",
    iconColor: "#FFB401",
    tag: "Data Security",
    title: "Encrypted Bid Vaults",
    description:
      "Bids are stored in secure, encrypted vaults that remain completely sealed and inaccessible until the exact public opening time.",
  },
  {
    id: "legal-compliance",
    icon: Scale,
    iconVariant: "copper",
    iconColor: "#B84A14",
    tag: "Legal Validity",
    title: "Legally Binding",
    description:
      "Fully compliant with the Electronic Transactions Act of Sri Lanka, rendering digital signatures, logs, and awards 100% legally binding.",
  },
  {
    id: "audit-trail",
    icon: Fingerprint,
    iconVariant: "brand",
    iconColor: "#953002",
    tag: "Transparency",
    title: "Immutable Audit Trail",
    description:
      "Every query, response, bid modification, and evaluation score is recorded on a permanent log that cannot be altered, ensuring full compliance.",
  },
];

export default function CoreFeatures() {
  return (
    <section className="cf-section">
      <div className="cf-inner">
        {/* Header */}
        <div className="cf-header">
          <span className="cf-badge">Security</span>
          <h2 className="cf-title">
            Built on <span className="cf-title-accent">Absolute</span> Trust
          </h2>
          <p className="cf-subtitle">
            A digital tendering environment designed to ensure compliance, legal validity, and complete confidentiality.
          </p>
        </div>

        {/* Symmetrical 4-Column Grid */}
        <div className="cf-grid">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div key={pillar.id} className="cf-card">
                <div className="cf-card-header">
                  <span className="cf-tag">{pillar.tag}</span>
                  <div className={`cf-icon-wrap cf-icon-wrap--${pillar.iconVariant}`}>
                    <Icon size={22} color={pillar.iconColor} strokeWidth={1.8} />
                  </div>
                </div>
                <h3 className="cf-card-title">{pillar.title}</h3>
                <p className="cf-card-desc">{pillar.description}</p>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="cf-cta-wrap">
          <a href="/security" className="cf-cta">
            Learn More About Security <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
