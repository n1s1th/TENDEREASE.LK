"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useHeroStore } from "@/store";

export default function HeroSection() {
  // ── Consume store — no local dummy data ───────────────────
  const slides = useHeroStore((s) => s.slides);
  const currentSlideIndex = useHeroStore((s) => s.currentSlide);
  const nextSlide = useHeroStore((s) => s.nextSlide);
  const prevSlide = useHeroStore((s) => s.prevSlide);
  const setSlide = useHeroStore((s) => s.setSlide);

  const slide = slides[currentSlideIndex];

  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        height: "520px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Background image with overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url('/hero01.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center 40%",
          zIndex: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.65) 100%)",
          }}
        />
      </div>

      {/* Left arrow */}
      <button
        onClick={prevSlide}
        aria-label="Previous slide"
        style={{
          position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)",
          zIndex: 2, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.35)",
          color: "#fff", width: 36, height: 36, borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", backdropFilter: "blur(4px)",
        }}
      >
        <ChevronLeft size={20} />
      </button>

      {/* Right arrow */}
      <button
        onClick={nextSlide}
        aria-label="Next slide"
        style={{
          position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)",
          zIndex: 2, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.35)",
          color: "#fff", width: 36, height: 36, borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", backdropFilter: "blur(4px)",
        }}
      >
        <ChevronRight size={20} />
      </button>

      {/* Content */}
      <div
        style={{
          position: "relative", zIndex: 1, width: "100%", maxWidth: 860,
          padding: "0 1.5rem", display: "flex", flexDirection: "column",
          gap: "2.5rem", marginTop: "-1.5rem",
        }}
      >
        {/* Bottom-left text block */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <span
            style={{
              display: "inline-block", background: "#953002", color: "#fff",
              fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em",
              padding: "0.2rem 0.6rem", borderRadius: 3, width: "fit-content",
            }}
          >
            {slide?.badge}
          </span>
          <h1
            style={{
              fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 800, color: "#fff",
              lineHeight: 1.25, maxWidth: 680,
              textShadow: "0 2px 8px rgba(0,0,0,0.4)", margin: 0,
            }}
          >
            {slide?.heading}
          </h1>
          <p
            style={{
              fontSize: "0.95rem", color: "rgba(255,255,255,0.85)",
              maxWidth: 580, lineHeight: 1.6,
              textShadow: "0 1px 4px rgba(0,0,0,0.35)", margin: 0,
            }}
          >
            {slide?.subtext}
          </p>
        </div>
      </div>

      {/* Dots */}
      <div
        style={{
          position: "absolute", bottom: "1.25rem", left: "50%",
          transform: "translateX(-50%)", zIndex: 2,
          display: "flex", gap: "0.5rem",
        }}
      >
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setSlide(i)}
            aria-label={`Slide ${i + 1}`}
            style={{
              width: 8, height: 8, borderRadius: "50%", border: "none",
              background: i === currentSlideIndex ? "#fff" : "rgba(255,255,255,0.45)",
              cursor: "pointer", padding: 0,
              transform: i === currentSlideIndex ? "scale(1.3)" : "scale(1)",
              transition: "background 0.2s, transform 0.2s",
            }}
          />
        ))}
      </div>
    </section>
  );
}
