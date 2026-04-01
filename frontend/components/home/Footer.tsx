"use client";

import Link from "next/link";
import { Facebook, Twitter, Linkedin, Youtube, FileText } from "lucide-react";

export default function Footer() {
  return (
    <footer style={{ width: "100%", fontFamily: "inherit" }}>
      {/* ── Newsletter Bar ── */}
      <div style={{ background: "#953002", padding: "1.25rem 1.5rem" }}>
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
          }}
        >
          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#fff", margin: 0 }}>
              Stay Updated on Tender Opportunities
            </h3>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.8rem", margin: "0.2rem 0 0" }}>
              Get the latest tenders delivered to your inbox every week.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              type="email"
              placeholder="Your email address"
              style={{
                width: 240,
                padding: "0.5rem 0.75rem",
                borderRadius: 6,
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.1)",
                color: "#fff",
                fontSize: "0.8rem",
                outline: "none",
              }}
            />
            <button
              style={{
                padding: "0.5rem 1.25rem",
                borderRadius: 6,
                border: "none",
                background: "#FFB401",
                color: "#111827",
                fontWeight: 700,
                fontSize: "0.8rem",
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

      {/* ── Main Footer ── */}
      <div
        style={{
          background: "#1b120f",
          padding: "2.5rem 1.5rem 1.5rem",
          color: "#9ca3af",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.5fr 1fr 1fr 1fr",
              gap: "2rem",
              marginBottom: "2rem",
            }}
          >
            {/* Brand */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 6,
                    background: "#FFB401",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#1b120f",
                  }}
                >
                  <FileText size={16} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#fff", margin: 0, lineHeight: 1 }}>
                    TenderHub
                  </h2>
                  <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "#FFB401", letterSpacing: "0.05em" }}>
                    .LK
                  </span>
                </div>
              </div>
              <p style={{ fontSize: "0.8rem", lineHeight: 1.55, color: "#9ca3af", margin: "0 0 1rem" }}>
                Sri Lanka&#39;s trusted digital tendering platform — connecting government procurement with qualified vendors.
              </p>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {[Facebook, Twitter, Linkedin, Youtube].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    style={{
                      width: 28,
                      height: 28,
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
                    <Icon size={14} />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 style={{ color: "#FFB401", fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.05em", marginBottom: "0.75rem", textTransform: "uppercase" }}>
                Quick Links
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {["Browse Tenders", "How It Works", "Register as Vendor", "Sign In", "Help / FAQ"].map((link) => (
                  <li key={link}>
                    <Link href="#" style={{ color: "#9ca3af", textDecoration: "none", fontSize: "0.8rem", transition: "color 0.2s" }}>
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 style={{ color: "#FFB401", fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.05em", marginBottom: "0.75rem", textTransform: "uppercase" }}>
                Categories
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {["Construction", "IT & Infrastructure", "Healthcare", "Education", "Logistics"].map((link) => (
                  <li key={link}>
                    <Link href="#" style={{ color: "#9ca3af", textDecoration: "none", fontSize: "0.8rem", transition: "color 0.2s" }}>
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 style={{ color: "#FFB401", fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.05em", marginBottom: "0.75rem", textTransform: "uppercase" }}>
                Resources
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {["Tender Guidelines", "Bid Templates", "Procurement Policy", "Vendor Handbook", "Contact Support"].map((link) => (
                  <li key={link}>
                    <Link href="#" style={{ color: "#9ca3af", textDecoration: "none", fontSize: "0.8rem", transition: "color 0.2s" }}>
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Strip */}
          <div
            style={{
              paddingTop: "1.25rem",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.75rem",
              fontSize: "0.7rem",
            }}
          >
            <p style={{ margin: 0, color: "rgba(255,255,255,0.35)" }}>
              &copy; 2026 TenderHub.lk — All rights reserved
            </p>
            <div style={{ display: "flex", gap: "1.25rem" }}>
              <Link href="#" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>Privacy Policy</Link>
              <Link href="#" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>Terms of Service</Link>
              <Link href="#" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
