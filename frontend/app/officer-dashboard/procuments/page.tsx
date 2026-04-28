"use client";

import { useState } from "react";
import { Upload, FileText, Search, ChevronDown } from "lucide-react";
import type { Procument } from "@/lib/types/officer-dashboard.types";

export default function ProcumentsPage() {
  const [procuments] = useState<Procument[]>([
    {
      id: "P101",
      title: "Procurement Title Placeholder",
      description: "Procurement Description Placeholder",
      procuringEntity: "Procuring Entity Name",
      department: "Department Name",
      category: "Procurement Category",
      method: "NCB",
    },
    {
      id: "P102",
      title: "Procurement Title Placeholder",
      description: "Procurement Description Placeholder",
      procuringEntity: "Procuring Entity Name",
      department: "Department Name",
      category: "Procurement Category",
      method: "NCB",
    },
  ]);

  return (
    <main className="dash-page">
      <div className="dash-content">
        <section className="dash-section">
          <h1 className="dash-notif-title" style={{ marginBottom: "2rem" }}>Upload Procuments Here</h1>

          {/* Upload Section */}
          <div style={{
            background: "#fff",
            border: "1px solid var(--te-border)",
            borderRadius: "12px",
            padding: "2rem",
            maxWidth: "500px",
            marginBottom: "3rem",
          }}>
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--te-gray-1)", marginBottom: "0.75rem" }}>
                Upload File
              </label>
              <div style={{
                border: "2px dashed var(--te-gray-4)",
                borderRadius: "8px",
                padding: "2.5rem 1rem",
                textAlign: "center",
                background: "transparent",
                cursor: "pointer",
                position: "relative"
              }}>
                <FileText size={32} style={{ color: "var(--te-gray-4)", margin: "0 auto 1rem" }} />
                <div style={{ fontSize: "0.875rem", color: "var(--te-gray-2)" }}>
                  Drag n Drop here<br />Or<br /><span style={{ color: "var(--te-primary)", fontWeight: 600 }}>Browse</span>
                </div>
                <ChevronDown size={16} style={{ position: "absolute", right: "1rem", bottom: "1rem", color: "var(--te-gray-1)" }} />
              </div>
            </div>
            <button
              className="dash-btn dash-btn--full"
              style={{
                background: "#BDBDBD",
                color: "#fff",
                fontWeight: 600,
                padding: "0.75rem",
                borderRadius: "8px",
                border: "none"
              }}
            >
              Upload Now
            </button>
          </div>

          <h2 className="dash-notif-title" style={{ marginBottom: "1.5rem" }}>Current Procument List</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {procuments.map((p) => (
              <div key={p.id} style={{
                background: "rgba(255, 180, 1, 0.03)",
                padding: "1.5rem",
                borderRadius: "4px",
                display: "grid",
                gap: "0.5rem",
                fontSize: "0.875rem",
                color: "var(--te-gray-1)"
              }}>
                <div><strong>Procument ID - {p.id}</strong></div>
                <div>Procurement Title: {p.title}</div>
                <div>Procurement Description: {p.description}</div>
                <div>Procuring Entity Name: {p.procuringEntity}</div>
                <div>Department: {p.department}</div>
                <div>Procurement Category: {p.category}</div>
                <div>Procurement Method ({p.method} / ICB / RFQ)</div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <button className="dash-btn" style={{ background: "var(--te-gray-2)", color: "#fff", padding: "0.5rem 1.5rem" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <FileText size={16} /> See All
              </span>
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
