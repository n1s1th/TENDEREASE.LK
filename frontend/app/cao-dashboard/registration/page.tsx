"use client";

import { useEffect, useState } from "react";
import { User, Check, Eye, Trash2 } from "lucide-react";
import DepartmentFilter from "@/components/cao-dashboard/DepartmentFilter";
import SearchInput from "@/components/cao-dashboard/SearchInput";
import EmptyState from "@/components/cao-dashboard/EmptyState";
import { useCAODashboardStore } from "@/store/cao-dashboard/cao-dashboard.store";

export default function RegistrationPage() {
  const registrations = useCAODashboardStore((s) => s.registrations);
  const registrationsLoading = useCAODashboardStore((s) => s.registrationsLoading);
  const fetchRegistrations = useCAODashboardStore((s) => s.fetchRegistrations);
  const acceptRegistration = useCAODashboardStore((s) => s.acceptRegistration);
  const deleteRegistration = useCAODashboardStore((s) => s.deleteRegistration);

  const [department, setDepartment] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchRegistrations(department || undefined, search || undefined);
  }, [fetchRegistrations, department, search]);

  return (
    <div className="dash-section">
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        <DepartmentFilter value={department} onChange={setDepartment} />
        <SearchInput value={search} onChange={setSearch} placeholder="Search officers..." />
      </div>

      {registrationsLoading ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "var(--te-gray-4)" }}>
          Loading…
        </div>
      ) : registrations.length === 0 ? (
        <EmptyState
          title="No registration requests"
          description="Officer registration requests will appear here once the backend is connected."
        />
      ) : (
        <div style={{ background: "var(--te-white)", borderRadius: "var(--te-radius)", border: "1px solid var(--te-border)", padding: "0 1.5rem" }}>
          {registrations.map((reg) => (
            <div key={reg.id} className="dash-officer-card">
              <div className="dash-officer-avatar-lg">
                <User size={22} />
              </div>

              <div className="dash-officer-info">
                <div className="dash-officer-name">{reg.name}</div>
                <div className="dash-officer-designation">{reg.designation} · {reg.department}</div>
                <div className="dash-officer-desc">{reg.description}</div>
              </div>

              <div className="dash-officer-actions">
                <button
                  className="dash-btn dash-btn--success dash-btn--sm"
                  onClick={() => acceptRegistration(reg.id)}
                >
                  <Check size={14} /> Accept
                </button>
                <button className="dash-btn dash-btn--outline dash-btn--sm">
                  <Eye size={14} /> View More
                </button>
                <button
                  className="dash-btn dash-btn--danger dash-btn--sm"
                  onClick={() => deleteRegistration(reg.id)}
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
