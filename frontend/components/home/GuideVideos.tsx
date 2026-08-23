"use client";

import { useState } from "react";
import { useVideoStore } from "@/store";
import { useShallow } from "zustand/shallow";

export default function GuideVideos() {
  // ── Consume store — no local dummy data ───────────────────
  const videos = useVideoStore(useShallow((s) => s.videos));
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  // We only show the first 3 videos to match the 3-column layout
  const displayVideos = videos.slice(0, 3);

  return (
    <section
      style={{
        position: "relative",
        padding: "6rem 1.5rem",
        overflow: "hidden",
      }}
    >
      {/* Background image with blur and overlay */}
      <div
        style={{
          position: "absolute",
          inset: -20, // Negative inset to prevent blurred edges from showing
          backgroundImage: "url('/hero-bg.png')", // Reusing the hero background
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(12px)",
          zIndex: 0,
        }}
      />
      {/* Dark tint over the blurred background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(27, 18, 15, 0.65)", // semi-transparent slate
          zIndex: 1,
        }}
      />

      <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 2 }}>
        
        {/* Video cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem" }}>
          {displayVideos.map((video) => {
            const isHovered = hoveredId === video.id;
            return (
              <a
                key={video.id}
                href={video.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => setHoveredId(video.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  height: 340,
                  borderRadius: 14,
                  overflow: "hidden",
                  textDecoration: "none",
                  boxShadow: isHovered ? "0 20px 40px -12px rgba(0,0,0,0.5)" : "0 8px 24px -10px rgba(0,0,0,0.3)",
                  transform: isHovered ? "translateY(-4px)" : "translateY(0)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                {/* Background Video Thumbnail */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transform: isHovered ? "scale(1.05)" : "scale(1)",
                    transition: "transform 0.5s ease",
                  }}
                />

                {/* Dark Gradient Overlay for text readability */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to top, rgba(27,18,15,0.95) 0%, rgba(27,18,15,0.6) 50%, transparent 100%)",
                    transition: "opacity 0.3s ease",
                  }}
                />

                {/* Centered YouTube Play Button container */}
                <div
                  style={{
                     position: "absolute",
                     top: 0, left: 0, right: 0, bottom: "35%",
                     display: "flex",
                     alignItems: "center",
                     justifyContent: "center",
                     zIndex: 2,
                  }}
                >
                  <div
                    style={{
                      transform: `scale(${isHovered ? 1.08 : 1})`,
                      transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      width: 60,
                      height: 42,
                      borderRadius: 10,
                      background: "#953002",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: isHovered ? "0 0 20px rgba(149,48,2,0.5)" : "0 4px 12px rgba(0,0,0,0.3)",
                    }}
                  >
                    <div
                      style={{
                        width: 0,
                        height: 0,
                        borderTop: "8px solid transparent",
                        borderBottom: "8px solid transparent",
                        borderLeft: "13px solid #fff",
                        marginLeft: 3,
                      }}
                    />
                  </div>
                </div>

                {/* Bottom Text Content */}
                <div
                  style={{
                    position: "relative",
                    padding: "1.25rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                    zIndex: 2,
                  }}
                >
                  {/* Title (max 2 lines) */}
                  <h3
                    style={{
                      margin: 0,
                      color: "#fff",
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      lineHeight: 1.4,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textShadow: "0 2px 4px rgba(0,0,0,0.6)",
                    }}
                  >
                    {video.title}
                  </h3>

                  {/* Watch Now Button */}
                  <div
                    style={{
                      alignSelf: "flex-start",
                      background: "#f8fafc",
                      color: "#1b120f",
                      padding: "0.5rem 1.1rem",
                      borderRadius: 999, // Pill shape
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      transition: "background 0.2s, transform 0.2s",
                      transform: isHovered ? "translateX(4px)" : "translateX(0)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                    }}
                  >
                    Watch Now
                    <span style={{ fontSize: "1rem", fontWeight: 400 }}>→</span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
