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

      <div style={{ maxWidth: 1250, margin: "0 auto", position: "relative", zIndex: 2 }}>
        
        {/* Video cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2.5rem" }}>
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
                  height: 480,
                  borderRadius: 24,
                  overflow: "hidden",
                  textDecoration: "none",
                  boxShadow: isHovered ? "0 25px 50px -12px rgba(0,0,0,0.6)" : "0 10px 30px -10px rgba(0,0,0,0.4)",
                  transform: isHovered ? "translateY(-8px)" : "translateY(0)",
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
                    background: "linear-gradient(to top, rgba(27,18,15,0.95) 0%, rgba(27,18,15,0.6) 40%, transparent 100%)",
                    transition: "opacity 0.3s ease",
                  }}
                />

                {/* Centered YouTube Play Button container */}
                <div
                  style={{
                     position: "absolute",
                     top: 0, left: 0, right: 0, bottom: "40%",
                     display: "flex",
                     alignItems: "center",
                     justifyContent: "center",
                     zIndex: 2,
                  }}
                >
                  <div
                    style={{
                      transform: `scale(${isHovered ? 1.1 : 1})`,
                      transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      width: 68,
                      height: 48,
                      borderRadius: 14,
                      background: "#953002",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: isHovered ? "0 0 30px rgba(149,48,2,0.6)" : "0 4px 15px rgba(0,0,0,0.3)",
                    }}
                  >
                    <div
                      style={{
                        width: 0,
                        height: 0,
                        borderTop: "10px solid transparent",
                        borderBottom: "10px solid transparent",
                        borderLeft: "16px solid #fff",
                        marginLeft: 4,
                      }}
                    />
                  </div>
                </div>

                {/* Bottom Text Content */}
                <div
                  style={{
                    position: "relative",
                    padding: "2rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.25rem",
                    zIndex: 2,
                  }}
                >
                  {/* Title (max 2 lines) */}
                  <h3
                    style={{
                      margin: 0,
                      color: "#fff",
                      fontSize: "1.35rem",
                      fontWeight: 700,
                      lineHeight: 1.35,
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
                      padding: "0.65rem 1.4rem",
                      borderRadius: 999, // Pill shape
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      transition: "background 0.2s, transform 0.2s",
                      transform: isHovered ? "translateX(4px)" : "translateX(0)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                    }}
                  >
                    Watch Now
                    <span style={{ fontSize: "1.1rem", fontWeight: 400 }}>→</span>
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
