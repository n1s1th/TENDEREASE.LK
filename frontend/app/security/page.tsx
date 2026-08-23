"use client";

import Link from "next/link";
import {
  ArrowLeft,
  UserCheck,
  Lock,
  Scale,
  Fingerprint,
  Shield,
  FileCheck,
  LockKeyhole,
  CheckCircle,
} from "lucide-react";

export default function SecurityPage() {
  return (
    <div style={{ background: "#ffffff", minHeight: "100vh", color: "#1f2937", fontFamily: "var(--font-inter), sans-serif" }}>
      {/* Navigation Header */}
      <header style={{ borderBottom: "1px solid #f3f4f6", padding: "1.25rem 2rem", position: "sticky", top: 0, background: "#ffffff", zIndex: 10 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center" }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "#6b7280",
              textDecoration: "none",
              fontSize: "0.9rem",
              fontWeight: 600,
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#953002")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7280")}
          >
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </header>

      {/* Hero Banner Section */}
      <section style={{ background: "linear-gradient(135deg, #fffcfb 0%, #fff5f0 100%)", padding: "4rem 2rem", borderBottom: "1px solid #f3f4f6" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "#fee2e2",
              color: "#953002",
              padding: "0.35rem 0.85rem",
              borderRadius: 999,
              fontSize: "0.78rem",
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              marginBottom: "1.5rem",
            }}
          >
            <Shield size={14} /> Trust & Security
          </div>
          <h1
            style={{
              fontSize: "clamp(2rem, 4vw, 2.75rem)",
              fontWeight: 800,
              color: "#111827",
              lineHeight: 1.15,
              marginBottom: "1.25rem",
            }}
          >
            Securing the Integrity of Public Procurement
          </h1>
          <p style={{ fontSize: "1.1rem", color: "#4b5563", lineHeight: 1.6, margin: 0 }}>
            TenderEase is built on absolute trust. Learn how we safeguard bid integrity, protect private data, and guarantee full audit compliance under Sri Lankan law.
          </p>
        </div>
      </section>

      {/* Trust & Security Pillars Breakdown */}
      <section style={{ padding: "5rem 2rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#111827", marginBottom: "0.75rem" }}>
              Our Four Pillars of Security
            </h2>
            <p style={{ color: "#6b7280", maxWidth: 600, margin: "0 auto", fontSize: "0.95rem" }}>
              Every feature on TenderEase is designed around these core security protocols to guarantee fairness, encryption, and auditability.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "2rem" }}>
            {/* Pillar 1 */}
            <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 16, padding: "2rem", transition: "transform 0.2s, box-shadow 0.2s" }}>
              <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: 10, background: "#fff5f0", color: "#953002", marginBottom: "1.25rem" }}>
                <UserCheck size={22} />
              </div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#111827", marginBottom: "0.75rem" }}>Verified Onboarding</h3>
              <p style={{ fontSize: "0.9rem", color: "#4b5563", lineHeight: 1.6, marginBottom: "1rem" }}>
                All participants, both procurement officers and prospective vendors, undergo rigorous background and identity verification.
              </p>
              <ul style={{ paddingLeft: "1.2rem", margin: 0, fontSize: "0.85rem", color: "#6b7280", lineHeight: 1.6 }}>
                <li style={{ marginBottom: "0.25rem" }}>Business registry alignment</li>
                <li style={{ marginBottom: "0.25rem" }}>Multi-factor authentication (MFA)</li>
                <li>Strict role-based access control (RBAC)</li>
              </ul>
            </div>

            {/* Pillar 2 */}
            <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 16, padding: "2rem", transition: "transform 0.2s, box-shadow 0.2s" }}>
              <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: 10, background: "#fffdf0", color: "#d97706", marginBottom: "1.25rem" }}>
                <Lock size={22} />
              </div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#111827", marginBottom: "0.75rem" }}>Encrypted Bid Vaults</h3>
              <p style={{ fontSize: "0.9rem", color: "#4b5563", lineHeight: 1.6, marginBottom: "1rem" }}>
                Bids are stored in high-grade encrypted vaults, completely sealed until the exact minute of the public bid opening.
              </p>
              <ul style={{ paddingLeft: "1.2rem", margin: 0, fontSize: "0.85rem", color: "#6b7280", lineHeight: 1.6 }}>
                <li style={{ marginBottom: "0.25rem" }}>AES-256 standard encryption</li>
                <li style={{ marginBottom: "0.25rem" }}>Zero-knowledge visibility before opening</li>
                <li>Automatic deadline sealing protocols</li>
              </ul>
            </div>

            {/* Pillar 3 */}
            <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 16, padding: "2rem", transition: "transform 0.2s, box-shadow 0.2s" }}>
              <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: 10, background: "#f0fdf4", color: "#16a34a", marginBottom: "1.25rem" }}>
                <Scale size={22} />
              </div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#111827", marginBottom: "0.75rem" }}>Legally Binding</h3>
              <p style={{ fontSize: "0.9rem", color: "#4b5563", lineHeight: 1.6, marginBottom: "1rem" }}>
                Complies with the Electronic Transactions Act of Sri Lanka, making virtual submissions fully binding in court.
              </p>
              <ul style={{ paddingLeft: "1.2rem", margin: 0, fontSize: "0.85rem", color: "#6b7280", lineHeight: 1.6 }}>
                <li style={{ marginBottom: "0.25rem" }}>Sri Lanka ETA Act No. 19 of 2006 compliance</li>
                <li style={{ marginBottom: "0.25rem" }}>Verified digital sign-offs</li>
                <li>Audit-ready PDF certificates of submission</li>
              </ul>
            </div>

            {/* Pillar 4 */}
            <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 16, padding: "2rem", transition: "transform 0.2s, box-shadow 0.2s" }}>
              <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: 10, background: "#f5f3ff", color: "#7c3aed", marginBottom: "1.25rem" }}>
                <Fingerprint size={22} />
              </div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#111827", marginBottom: "0.75rem" }}>Immutable Audit Trail</h3>
              <p style={{ fontSize: "0.9rem", color: "#4b5563", lineHeight: 1.6, marginBottom: "1rem" }}>
                Every action taken on a tender—from creation to the final evaluation—is logged in a permanent registry.
              </p>
              <ul style={{ paddingLeft: "1.2rem", margin: 0, fontSize: "0.85rem", color: "#6b7280", lineHeight: 1.6 }}>
                <li style={{ marginBottom: "0.25rem" }}>Tamper-evident logs with checksums</li>
                <li style={{ marginBottom: "0.25rem" }}>Non-repudiation tracking for all users</li>
                <li>Comprehensive activity dashboard exports</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Deep-dive Security Standards */}
      <section style={{ background: "#f9fafb", padding: "5rem 2rem", borderTop: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#111827", marginBottom: "2rem", textAlign: "center" }}>
            Technical Security Architecture
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
            <div style={{ display: "flex", gap: "1.5rem" }}>
              <div style={{ color: "#953002", flexShrink: 0 }}>
                <LockKeyhole size={28} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#111827", marginBottom: "0.5rem" }}>
                  How Sealed Bid Vaults Work
                </h3>
                <p style={{ fontSize: "0.95rem", color: "#4b5563", lineHeight: 1.6, margin: 0 }}>
                  When a vendor submits a bid proposal, the document and cost sheets are immediately encrypted on the client side using asymmetric cryptography before transmission. The decryption key is locked until the countdown timer for the public tender opening reaches zero. This guarantees that neither rival bidders nor procurement officers can view any part of the bid during the submission period.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "1.5rem" }}>
              <div style={{ color: "#953002", flexShrink: 0 }}>
                <FileCheck size={28} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#111827", marginBottom: "0.5rem" }}>
                  Compliance with Sri Lanka Legislation
                </h3>
                <p style={{ fontSize: "0.95rem", color: "#4b5563", lineHeight: 1.6, margin: 0 }}>
                  Under the Sri Lankan Electronic Transactions Act No. 19 of 2006, electronic contracts and log submissions carry the same legal weight as traditional hardcopy documents. TenderEase auto-generates digital timestamp hashes for every submission, providing irrefutable, legally binding evidence of compliance with government procurement guidelines.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "1.5rem" }}>
              <div style={{ color: "#953002", flexShrink: 0 }}>
                <CheckCircle size={28} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#111827", marginBottom: "0.5rem" }}>
                  Data Privacy and Storage Security
                </h3>
                <p style={{ fontSize: "0.95rem", color: "#4b5563", lineHeight: 1.6, margin: 0 }}>
                  All persistent database records are hosted on secure enterprise clouds with periodic snapshot backups. Sensitive personal identification and bank details are isolated and encrypted at rest using industry standard AES-256 protocols.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action footer */}
      <section style={{ padding: "5rem 2rem", textAlign: "center", background: "#ffffff" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#111827", marginBottom: "1rem" }}>
            Ready to Participate Securely?
          </h2>
          <p style={{ color: "#6b7280", marginBottom: "2rem", fontSize: "0.95rem" }}>
            Register your business today to access verified government bids or log in as a procurement officer to host tenders.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
            <Link
              href="/vendor-registration"
              style={{
                background: "#953002",
                color: "#ffffff",
                padding: "0.75rem 1.5rem",
                borderRadius: 8,
                fontSize: "0.9rem",
                fontWeight: 600,
                textDecoration: "none",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#7d2802")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#953002")}
            >
              Register as Vendor
            </Link>
            <Link
              href="/officer-registration"
              style={{
                background: "#ffffff",
                color: "#953002",
                border: "1.5px solid #953002",
                padding: "0.75rem 1.5rem",
                borderRadius: 8,
                fontSize: "0.9rem",
                fontWeight: 600,
                textDecoration: "none",
                transition: "background 0.2s, color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#fff5f0";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#ffffff";
              }}
            >
              Register as Officer
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
