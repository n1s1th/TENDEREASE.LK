"use client";

import Link from "next/link";
import { useNewsStore } from "@/store";
import { useShallow } from "zustand/shallow";

export default function NewsSection() {
  // ── Consume store — no local dummy data ───────────────────
  const activeTab = useNewsStore((s) => s.activeTab);
  const setActiveTab = useNewsStore((s) => s.setActiveTab);
  // useShallow prevents SSR 'getServerSnapshot' infinite loop for array selectors
  const filtered = useNewsStore(
    useShallow((s) => s.items.filter((i) => i.tab === s.activeTab))
  );

  return (
    <section style={{ background: "#1b120f", padding: "5rem 1.5rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "2.5rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          {/* Left: Title + View all */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#fff", margin: 0 }}>
              News
            </h2>
            <a
              href="/news"
              style={{
                display: "inline-block",
                padding: "0.3rem 0.9rem",
                border: "1px solid rgba(255,255,255,0.25)",
                borderRadius: 20,
                color: "rgba(255,255,255,0.7)",
                fontSize: "0.8rem",
                fontWeight: 500,
                textDecoration: "none",
                transition: "border-color 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "#fff";
                (e.currentTarget as HTMLAnchorElement).style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.25)";
                (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.7)";
              }}
            >
              View all
            </a>
          </div>

          {/* Right: News / Events toggle */}
          <div
            style={{
              display: "flex",
              background: "rgba(255,255,255,0.08)",
              borderRadius: 24,
              padding: "0.25rem",
              gap: "0.25rem",
            }}
          >
            {(["News", "Events"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "0.4rem 1.25rem",
                  borderRadius: 20,
                  border: "none",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background 0.2s, color 0.2s",
                  background: activeTab === tab ? "#953002" : "transparent",
                  color: activeTab === tab ? "#fff" : "rgba(255,255,255,0.55)",
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Cards grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem" }}>
          {filtered.map((item) => (
            <Link
              key={item.id}
              href={`/news/${item.id}`}
              style={{
                borderRadius: 14,
                overflow: "hidden",
                background: "#261b17",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.2s, box-shadow 0.2s",
                cursor: "pointer",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-4px)";
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 16px 40px rgba(0,0,0,0.4)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none";
              }}
            >
              {/* Image */}
              <div style={{ position: "relative", height: 200, overflow: "hidden" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1.06)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1)"; }}
                />
                <div
                  style={{
                    position: "absolute", bottom: 0, left: 0, right: 0, height: "50%",
                    background: "linear-gradient(to top, rgba(38,27,23,0.9), transparent)",
                  }}
                />
                <div
                  style={{
                    position: "absolute", bottom: "0.75rem", left: "0.875rem",
                    display: "flex", alignItems: "center", gap: "0.5rem",
                  }}
                >
                  <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.7)" }}>{item.date}</span>
                  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.7rem" }}>•</span>
                  <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#e05912", letterSpacing: "0.08em" }}>
                    {item.category}
                  </span>
                </div>
              </div>

              {/* Card body */}
              <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem", flex: 1 }}>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#f1f5f9", lineHeight: 1.5, margin: 0, flex: 1 }}>
                  {item.title}
                </h3>
                <div
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "0.35rem",
                    padding: "0.45rem 1rem", border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 6, color: "rgba(255,255,255,0.7)", fontSize: "0.8rem",
                    fontWeight: 500, width: "fit-content",
                    transition: "background 0.15s, border-color 0.15s, color 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.background = "rgba(149,48,2,0.3)";
                    el.style.borderColor = "#bd4005";
                    el.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.background = "transparent";
                    el.style.borderColor = "rgba(255,255,255,0.15)";
                    el.style.color = "rgba(255,255,255,0.7)";
                  }}
                >
                  View Now →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
