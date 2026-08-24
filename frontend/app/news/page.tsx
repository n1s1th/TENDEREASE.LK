"use client";

import Link from "next/link";
import { useNewsStore } from "@/store";
import { useShallow } from "zustand/shallow";
import Footer from "@/components/home/Footer";

export default function NewsIndexPage() {
  const activeTab = useNewsStore((s) => s.activeTab);
  const setActiveTab = useNewsStore((s) => s.setActiveTab);
  const filtered = useNewsStore(
    useShallow((s) => s.items.filter((i) => i.tab === s.activeTab))
  );

  return (
    <div style={{ background: "#ffffff", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Hero Section */}
      <section style={{ padding: "5rem 1.5rem 3.5rem", textAlign: "center", background: "#fdfbfa", borderBottom: "1px solid rgba(149,48,2,0.06)" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <span
            style={{
              display: "inline-block",
              padding: "0.25rem 0.75rem",
              background: "rgba(149,48,2,0.08)",
              color: "#953002",
              borderRadius: "999px",
              fontSize: "0.75rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "1rem",
            }}
          >
            TenderEase Updates
          </span>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#111827", margin: 0 }}>
            News & Press Events
          </h1>
          <p style={{ color: "#4b5563", fontSize: "1rem", marginTop: "1rem", lineHeight: 1.6 }}>
            Stay informed with the latest updates on procurement policies, vendor workshops, and platform announcements.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section style={{ flex: 1, padding: "4rem 1.5rem 6rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          {/* Tabs Filter */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "3rem",
            }}
          >
            <div
              style={{
                display: "flex",
                background: "#f3f4f6",
                borderRadius: 24,
                padding: "0.3rem",
                gap: "0.3rem",
              }}
            >
              {(["News", "Events"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: "0.6rem 2rem",
                    borderRadius: 20,
                    border: "none",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    background: activeTab === tab ? "#953002" : "transparent",
                    color: activeTab === tab ? "#fff" : "#4b5563",
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "2rem",
            }}
          >
            {filtered.map((item) => (
              <Link
                key={item.id}
                href={`/news/${item.id}`}
                style={{
                  borderRadius: 14,
                  overflow: "hidden",
                  background: "#ffffff",
                  display: "flex",
                  flexDirection: "column",
                  textDecoration: "none",
                  transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease",
                  border: "1px solid rgba(149,48,2,0.08)",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.transform = "translateY(-6px)";
                  el.style.boxShadow = "0 20px 40px -12px rgba(149, 48, 2, 0.12)";
                  el.style.borderColor = "rgba(149, 48, 2, 0.2)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.transform = "translateY(0)";
                  el.style.boxShadow = "none";
                  el.style.borderColor = "rgba(149,48,2,0.08)";
                }}
              >
                {/* Image */}
                <div style={{ position: "relative", height: 220, overflow: "hidden" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: "60%",
                      background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: "1rem",
                      left: "1rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.85)" }}>{item.date}</span>
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem" }}>•</span>
                    <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#ffb401", letterSpacing: "0.08em" }}>
                      {item.category}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", flex: 1 }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1f2937", lineHeight: 1.5, margin: 0, flex: 1 }}>
                    {item.title}
                  </h3>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      color: "#953002",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                    }}
                  >
                    Read Article →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
