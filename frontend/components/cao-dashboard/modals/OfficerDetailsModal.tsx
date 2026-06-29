"use client";

import { useState, useEffect } from "react";
import { X, User, ChevronDown, Pencil, Trash2 } from "lucide-react";
import { useCAODashboardStore } from "@/store/cao-dashboard/cao-dashboard.store";
import { useOfficerDashboardStore } from "@/store/officer-dashboard/officer-dashboard.store";
import SearchInput from "@/components/cao-dashboard/SearchInput";

const departmentTabs = [
  "All",
  "Education",
  "Agriculture",
  "Technology",
  "Health",
  "Transportation",
  "Finance",
];

export default function OfficerDetailsModal() {
  const activeModal = useCAODashboardStore((s) => s.activeModal);
  const closeModal = useCAODashboardStore((s) => s.closeModal);
  const officers = useOfficerDashboardStore((s) => s.officers);
  const fetchOfficers = useOfficerDashboardStore((s) => s.fetchOfficers);

  const [activeDept, setActiveDept] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (activeModal === "officer-details") {
      fetchOfficers(
        activeDept === "All" ? undefined : activeDept,
        searchQuery || undefined,
      );
    }
  }, [activeModal, activeDept, searchQuery, fetchOfficers]);

  if (activeModal !== "officer-details") return null;

  return (
    <div className="dash-modal-overlay" onClick={closeModal}>
      <div className="dash-modal dash-modal--lg" onClick={(e) => e.stopPropagation()}>
        <button className="dash-modal-close" onClick={closeModal}>
          <X size={16} />
        </button>

        <div className="dash-modal-header">
          <h2 className="dash-modal-title">Officer Details</h2>
        </div>

        <div className="dash-modal-body">
          {/* Search */}
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search officers..."
          />

          {/* Department Tabs */}
          <div className="dash-dept-tabs" style={{ marginTop: "1rem" }}>
            {departmentTabs.map((dept) => (
              <button
                key={dept}
                className={`dash-dept-tab ${activeDept === dept ? "dash-dept-tab--active" : ""}`}
                onClick={() => setActiveDept(dept)}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* Officer List */}
          {officers.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "var(--te-gray-4)", fontSize: "0.875rem" }}>
              No officers found. Data will load when the backend is connected.
            </div>
          ) : (
            officers.map((officer) => (
              <div key={officer.id} className="dash-officer-row">
                <div className="dash-table-avatar">
                  <User size={16} />
                </div>
                <div className="dash-officer-row-info">
                  <div className="dash-officer-row-name">{officer.name}</div>
                  <div className="dash-officer-row-meta">
                    {officer.email} · {officer.contactNumber} · Age: {officer.age}
                  </div>
                </div>

                {/* Role select */}
                <select
                  className="dash-select"
                  style={{ minWidth: 140, height: 34, fontSize: "0.8rem" }}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select Role
                  </option>
                  <option value="procurement_officer">Procurement Officer</option>
                  <option value="technical_evaluator">Technical Evaluator</option>
                  <option value="financial_evaluator">Financial Evaluator</option>
                  <option value="committee_member">Committee Member</option>
                </select>

                <div className="dash-officer-row-actions">
                  <button className="dash-btn dash-btn--secondary dash-btn--sm">
                    Assign
                  </button>
                  <button className="dash-btn dash-btn--ghost dash-btn--sm" aria-label="Edit">
                    <Pencil size={14} />
                  </button>
                  <button className="dash-btn dash-btn--ghost dash-btn--sm" aria-label="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
