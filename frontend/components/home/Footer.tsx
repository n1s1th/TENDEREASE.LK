"use client";

import Link from "next/link";
import { FileText, Share2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full font-sans overflow-hidden">
      {/* ── Top Newsletter Bar ── */}
      <div
        style={{
          background: "#953002", // burnt orange
          padding: "2.5rem 1.5rem",
        }}
      >
        <div
          style={{
            width: "100%",
            margin: "0 auto",
            padding: "0 1.5rem",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1.5rem",
          }}
        >
          {/* Left formatting */}
          <div style={{ flex: "1 1 300px", minWidth: 0 }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff", margin: "0 0 0.4rem 0" }}>
              Stay Updated on Tender Opportunities
            </h3>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.9rem", margin: 0 }}>
              Get the latest tenders delivered to your inbox every week.
            </p>
          </div>

          {/* Right Input Group */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", flex: "1 1 300px", justifyContent: "flex-start", lg: { justifyContent: "flex-end" } }}>
            <input
              type="email"
              placeholder="Your email address"
              style={{
                flex: "1 1 200px",
                maxWidth: 320,
                padding: "0.75rem 1rem",
                borderRadius: 6,
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.1)",
                color: "#fff",
                fontSize: "0.9rem",
                outline: "none",
              }}
            />
            <button
              style={{
                padding: "0.75rem 1.5rem",
                borderRadius: 6,
                border: "none",
                background: "#FFB401", // yellow hook
                color: "#111827",      // dark text
                fontWeight: 700,
                fontSize: "0.9rem",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#ffc633")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#FFB401")}
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Footer Area ── */}
      <div
        style={{
          background: "#1b120f", // slate 900
          padding: "4rem 1.5rem 2rem",
          color: "#9ca3af",
        }}
      >
        <div style={{ width: "100%", margin: "0 auto", padding: "0 1.5rem" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "3rem",
              marginBottom: "4rem",
            }}
          >
            {/* Column 1: Brand Info */}
            <div style={{ gridColumn: "1 / -1", maxWidth: "300px" }}>
              {/* Logo */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: "#FFB401",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#1b120f",
                  }}
                >
                  <FileText size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#fff", margin: 0, lineHeight: 1 }}>
                    TenderHub
                  </h2>
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#FFB401", letterSpacing: "0.05em" }}>
                    .LK
                  </span>
                </div>
              </div>
              <p style={{ fontSize: "0.85rem", lineHeight: 1.6, color: "#9ca3af", marginBottom: "1.5rem" }}>
                Sri Lanka's most trusted digital tendering platform — connecting government procurement with qualified vendors transparently.
              </p>
              {/* Social Icons */}
              <div style={{ display: "flex", gap: "0.75rem" }}>
                {[Share2, Share2, Share2, Share2].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                      background: "rgba(255,255,255,0.05)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.15)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.05)")}
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h4 style={{ color: "#FFB401", fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.05em", marginBottom: "1.5rem", textTransform: "uppercase" }}>
                Quick Links
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
                {["Browse Tenders", "How It Works", "Register as Vendor", "Sign In", "Help / FAQ"].map((link) => (
                  <li key={link}>
                    <Link href="#" style={{ color: "#9ca3af", textDecoration: "none", fontSize: "0.85rem", transition: "color 0.2s" }}>
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Categories */}
            <div>
              <h4 style={{ color: "#FFB401", fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.05em", marginBottom: "1.5rem", textTransform: "uppercase" }}>
                Categories
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
                {["Construction", "IT & Infrastructure", "Healthcare", "Education", "Logistics"].map((link) => (
                  <li key={link}>
                    <Link href="#" style={{ color: "#9ca3af", textDecoration: "none", fontSize: "0.85rem", transition: "color 0.2s" }}>
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Resources */}
            <div>
              <h4 style={{ color: "#FFB401", fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.05em", marginBottom: "1.5rem", textTransform: "uppercase" }}>
                Resources
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
                {["Tender Guidelines", "Bid Templates", "Procurement Policy", "Vendor Handbook", "Contact Support"].map((link) => (
                  <li key={link}>
                    <Link href="#" style={{ color: "#9ca3af", textDecoration: "none", fontSize: "0.85rem", transition: "color 0.2s" }}>
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── Bottom Strip ── */}
          <div
            style={{
              paddingTop: "2rem",
              borderTop: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
              fontSize: "0.75rem",
            }}
          >
            <p style={{ margin: 0, color: "rgba(255,255,255,0.4)" }}>
              &copy; 2026 TenderHub.lk - All rights reserved • Licensed under the Sri Lanka Procurement Act
            </p>
            <div style={{ display: "flex", gap: "1.5rem" }}>
              <Link href="#" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Privacy Policy</Link>
              <Link href="#" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Terms of Service</Link>
              <Link href="#" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
