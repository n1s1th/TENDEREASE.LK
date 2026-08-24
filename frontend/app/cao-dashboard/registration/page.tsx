"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { User, Check, X, Mail, Phone, Building2, MapPin, Search } from "lucide-react";
import { useCAODashboardStore } from "@/store/cao-dashboard/cao-dashboard.store";
import EmptyState from "@/components/cao-dashboard/EmptyState";
import KpiCards from "@/components/cao-dashboard/KpiCards";
import type { RegistrationStatus, RegistrationRequest } from "@/lib/types/cao-dashboard.types";
import { useSearchParams } from "next/navigation";

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  PENDING: { bg: "#fef3c7", text: "#92400e", label: "Pending" },
  APPROVED: { bg: "#d1fae5", text: "#065f46", label: "Approved" },
  REJECTED: { bg: "#fee2e2", text: "#991b1b", label: "Rejected" },
};

function RegistrationPageContent() {
  const searchParams = useSearchParams();
  const registrations = useCAODashboardStore((s) => s.registrations);
  const registrationsLoading = useCAODashboardStore((s) => s.registrationsLoading);
  const fetchRegistrations = useCAODashboardStore((s) => s.fetchRegistrations);
  const acceptRegistration = useCAODashboardStore((s) => s.acceptRegistration);
  const rejectRegistration = useCAODashboardStore((s) => s.rejectRegistration);
  const registrationStatusFilter = useCAODashboardStore((s) => s.registrationStatusFilter);
  const setRegistrationStatusFilter = useCAODashboardStore((s) => s.setRegistrationStatusFilter);
  const registrationSearch = useCAODashboardStore((s) => s.registrationSearch);
  const setRegistrationSearch = useCAODashboardStore((s) => s.setRegistrationSearch);
  const kpiSummary = useCAODashboardStore((s) => s.kpiSummary);
  const fetchKpiSummary = useCAODashboardStore((s) => s.fetchKpiSummary);

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<RegistrationRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [approveTarget, setApproveTarget] = useState<RegistrationRequest | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (registrationSearch) {
      setSearchInput(registrationSearch);
    }
  }, [registrationSearch]);

  useEffect(() => {
    const idParam = searchParams.get('id');
    if (idParam) {
      setSearchInput(idParam);
      setRegistrationStatusFilter("ALL");
    }
  }, [searchParams, setRegistrationStatusFilter]);

  useEffect(() => {
    fetchRegistrations();
    fetchKpiSummary();
  }, [fetchRegistrations, fetchKpiSummary, registrationStatusFilter]);

  const handleApproveClick = (reg: RegistrationRequest) => {
    setApproveTarget(reg);
    setApproveModalOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (submitting) return;
    if (approveTarget) {
      setSubmitting(true);
      try {
        await acceptRegistration(approveTarget.officerId);
        setApproveModalOpen(false);
        setApproveTarget(null);
      } catch (err) {
        // Error toast is handled by store
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleReject = (reg: RegistrationRequest) => {
    setRejectTarget(reg);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (submitting) return;
    if (rejectTarget && rejectReason.trim()) {
      setSubmitting(true);
      try {
        await rejectRegistration(rejectTarget.officerId, rejectReason);
        setRejectModalOpen(false);
        setRejectTarget(null);
        setRejectReason("");
      } catch (err) {
        // Error toast is handled by store
      } finally {
        setSubmitting(false);
      }
    }
  };

  // Client-side search filter
  const filtered = registrations.filter((reg) => {
    if (!searchInput) return true;
    const q = searchInput.toLowerCase().trim();
    return (
      reg.officialEmail?.toLowerCase().includes(q) ||
      reg.registrationReference?.toLowerCase().includes(q) ||
      reg.officerId?.toLowerCase().includes(q) ||
      reg.procuringEntityType?.toLowerCase().includes(q) ||
      reg.liaisonOfficer?.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="dash-section">
      {/* Filters */}
      <div className="flex items-center justify-between gap-4 mb-8 w-full font-sans">
        {/* Status filter badges */}
        <div className="flex items-center gap-2 flex-wrap flex-grow">
          {(["PENDING", "APPROVED", "REJECTED", "ALL"] as const).map((s) => {
            const isActive = registrationStatusFilter === s;
            const label = s === "ALL" ? "All" : statusColors[s]?.label || s;
            
            return (
              <button
                key={s}
                onClick={() => setRegistrationStatusFilter(s)}
                className={`px-4 py-2 text-sm font-bold rounded-xl border transition-all duration-200 ${
                  isActive 
                    ? "bg-[#953002] text-white border-[#953002] shadow-md" 
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300 shadow-sm"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="flex items-center gap-3 bg-white border border-slate-200/80 px-4 py-2.5 rounded-xl flex-grow max-w-lg shadow-sm focus-within:ring-2 focus-within:ring-[#953002]/20 transition-all duration-200">
          <Search size={18} className="text-slate-400 flex-shrink-0" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search registrations by email, ref no, or institution…"
            className="bg-transparent border-none outline-none text-sm text-slate-800 placeholder-slate-400 w-full"
          />
        </div>

      </div>

      {/* Cards */}
      {registrationsLoading ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "var(--te-gray-4)" }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No registration requests"
          description={registrationStatusFilter === "ALL" ? "No registrations found." : `No ${registrationStatusFilter.toLowerCase()} registrations found.`}
        />
      ) : (
        <div className="flex flex-col gap-6 font-sans">
          {filtered.map((reg) => {
            const st = statusColors[reg.status] || statusColors.PENDING;
            const isExpanded = expandedCard === reg.officerId;

            return (
              <div
                key={reg.officerId}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col lg:flex-row lg:items-start gap-6 relative w-full"
              >
                {/* Main details block */}
                <div className="flex-1 flex flex-col md:flex-row gap-6">
                  {/* Left block - Entity name & general data */}
                  <div className="flex items-start gap-4 min-w-[280px]">
                    <div className="w-12 h-12 rounded-full bg-[#953002]/10 flex items-center justify-center text-[#953002] flex-shrink-0 shadow-sm">
                      <Building2 size={22} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {(reg as any).procuringEntityType === "Government Institution" && (
                          <span>
                            Government Institution
                            {(reg as any).procuringEntityLevel ? ` · ${(reg as any).procuringEntityLevel}` : ""}
                          </span>
                        )}
                        {(reg as any).procuringEntityType === "Provincial Council" && (
                          <span>
                            Provincial Council
                            {(reg as any).provincialCouncil ? ` · ${(reg as any).provincialCouncil}` : ""}
                            {(reg as any).procuringEntityLevel ? ` · ${(reg as any).procuringEntityLevel}` : ""}
                          </span>
                        )}
                        {!["Government Institution", "Provincial Council"].includes((reg as any).procuringEntityType) && (
                          <span>
                            {(reg as any).procuringEntityType || "Government Institution"}
                            {(reg as any).provincialCouncil ? ` · ${(reg as any).provincialCouncil}` : ""}
                            {(reg as any).procuringEntityLevel ? ` · ${(reg as any).procuringEntityLevel}` : ""}
                          </span>
                        )}
                      </h3>
                      <span className="text-xs text-slate-400 block mt-0.5 font-medium">
                        Ref: {reg.registrationReference}
                      </span>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="px-2.5 py-0.5 text-xs font-bold rounded-md uppercase tracking-wide border shadow-sm flex items-center justify-center" style={{ backgroundColor: st.bg, color: st.text, borderColor: st.bg }}>
                          {st.label}
                        </span>
                        <span className="px-2 py-0.5 text-xs font-semibold text-slate-400 bg-slate-50 border border-slate-100 rounded-md">
                          {new Date(reg.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Middle block - Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 flex-grow bg-slate-50 p-5 rounded-xl border border-slate-200">
                    <div>
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Head Designation</span>
                      <span className="text-sm font-medium text-slate-800">
                        {reg.headDesignation ? `${reg.headDesignation}` : "Head of Institution"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Official Email</span>
                      <span className="text-sm font-medium text-slate-800 truncate block">
                        {reg.officialEmail}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Land Phone</span>
                      <span className="text-sm font-medium text-slate-800">
                        {reg.personalLandPhone || "N/A"}
                      </span>
                    </div>
                    
                    {reg.address && (
                      <div className="sm:col-span-2">
                        <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Address</span>
                        <span className="text-sm font-medium text-slate-800 leading-relaxed block">
                          {[
                            reg.address.streetLine1,
                            reg.address.streetLine2,
                            reg.address.city,
                            reg.address.province,
                            reg.address.postalCode,
                            reg.address.country
                          ].filter(Boolean).join(", ")}
                        </span>
                      </div>
                    )}
                    
                    {reg.businessRegistrationNumber && (
                      <div>
                        <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Business Reg No (BRN)</span>
                        <span className="text-sm font-medium text-slate-800 truncate block">
                          {reg.businessRegistrationNumber}
                        </span>
                      </div>
                    )}
                    
                    {reg.vatRegistrationNumber && (
                      <div>
                        <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">VAT Reg No</span>
                        <span className="text-sm font-medium text-slate-800 truncate block">
                          {reg.vatRegistrationNumber}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right block - Expandable liaison details / actions */}
                <div className="flex flex-col justify-between items-end min-w-[280px] h-full gap-4 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6">
                  {reg.liaisonOfficer && (
                    <div className="w-full">
                      <button
                        onClick={() => setExpandedCard(isExpanded ? null : reg.officerId)}
                        className="text-sm font-bold text-[#953002] hover:text-[#752400] transition-all flex items-center justify-between w-full bg-orange-50/50 hover:bg-orange-50 px-4 py-2.5 rounded-lg border border-orange-100/50"
                      >
                        <span>{isExpanded ? "Hide Liaison Officer" : "View Liaison Officer"}</span>
                        <svg className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </button>
                      {isExpanded && (
                        <div className="mt-3 bg-white border border-slate-200 p-4 rounded-xl shadow-sm text-sm space-y-2.5 text-slate-700 animate-fadeIn">
                          <div className="flex flex-col"><span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Name</span><span className="font-medium">{reg.liaisonOfficer.title} {reg.liaisonOfficer.name}</span></div>
                          <div className="flex flex-col"><span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Designation</span><span className="font-medium">{reg.liaisonOfficer.designation}</span></div>
                          <div className="flex flex-col"><span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">NIC</span><span className="font-medium">{reg.liaisonOfficer.nic}</span></div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col"><span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mobile</span><span className="font-medium truncate">{reg.liaisonOfficer.mobile}</span></div>
                            <div className="flex flex-col"><span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email</span><span className="font-medium truncate" title={reg.liaisonOfficer.email}>{reg.liaisonOfficer.email}</span></div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {reg.status === "REJECTED" && (
                    <div className="bg-red-50 text-[#953002] p-3.5 rounded-xl border border-slate-200 text-sm w-full font-sans space-y-1 shadow-sm mt-2">
                      <div><strong>Rejection Reason:</strong> {reg.rejectionReason || "No reason provided."}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 pt-1 border-t border-slate-100 mt-1">
                        <strong>Rejected On:</strong>
                        <span>{reg.updatedAt ? new Date(reg.updatedAt).toLocaleString() : new Date(reg.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  {reg.status === "PENDING" && (
                    <div className="flex items-center gap-2 w-full mt-auto pt-4 font-sans">
                      <button
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-bold rounded-xl text-white bg-[#953002] hover:bg-[#b03b03] transition-all shadow-md"
                        onClick={() => handleApproveClick(reg)}
                      >
                        <Check size={16} /> Approve
                      </button>
                      <button
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-bold rounded-xl text-[#953002] bg-white border border-[#953002] hover:bg-[#fdf6f2] transition-all shadow-sm"
                        onClick={() => handleReject(reg)}
                      >
                        <X size={16} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <KpiCards data={kpiSummary} />

      {/* Approve Confirmation Modal */}
      {approveModalOpen && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-md flex items-center justify-center z-[1000] p-6 font-sans animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 w-full max-w-xl shadow-2xl border-t-8 border-[#953002] transform transition-all animate-scaleIn relative">
            <h3 className="text-2xl font-extrabold text-slate-900 mb-3 tracking-tight">
              Approve Officer Registration
            </h3>
            
            <p className="text-base text-slate-600 mb-8 leading-relaxed">
              Are you sure you want to approve the officer registration for{" "}
              <strong className="text-[#953002] font-bold">
                {(approveTarget as any)?.procuringEntityType || "Government Institution"}</strong>?
              <span className="block mt-2 text-slate-400 text-sm">This will grant them permissions to create and manage tenders on behalf of their institution.</span>
            </p>
            
            <div className="flex items-center justify-end gap-4">
              <button
                className="px-6 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all shadow-sm disabled:opacity-50"
                onClick={() => setApproveModalOpen(false)}
                disabled={submitting}
              >
                No, Cancel
              </button>
              <button
                className="px-6 py-3 text-sm font-bold text-white bg-[#953002] hover:bg-[#752400] rounded-xl transition-all shadow-md flex items-center gap-2 border border-[#953002] disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleConfirmApprove}
                disabled={submitting}
              >
                <Check size={18} /> {submitting ? "Approving..." : "Yes, Confirm Approval"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-md flex items-center justify-center z-[1000] p-6 font-sans animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 w-full max-w-xl shadow-2xl border-t-8 border-[#953002] transform transition-all animate-scaleIn relative">
            <h3 className="text-2xl font-extrabold text-slate-900 mb-3 tracking-tight">
              Reject Officer Registration
            </h3>
            
            <p className="text-base text-slate-600 mb-4 leading-relaxed">
              Rejecting registration for{" "}
              <strong className="text-[#953002] font-bold">
                {(rejectTarget as any)?.procuringEntityType || "Government Institution"}
              </strong>.
              The officer will receive an automated notification.
            </p>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Please provide a clear explanation for the rejection..."
              rows={4}
              className="w-full p-4 rounded-xl border-2 border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:ring-4 focus:ring-[#953002]/10 focus:border-[#953002] outline-none transition-all resize-none mb-8"
            />

            <div className="flex items-center justify-end gap-4">
              <button
                className="px-6 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all shadow-sm disabled:opacity-50"
                onClick={() => setRejectModalOpen(false)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                className="px-6 py-3 text-sm font-bold text-white bg-[#953002] hover:bg-[#752400] rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed border border-[#953002]"
                onClick={handleConfirmReject}
                disabled={!rejectReason.trim() || submitting}
              >
                {submitting ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { Suspense } from "react";

export default function RegistrationPage() {
  return (
    <Suspense fallback={<div className="dash-section" style={{ padding: "3rem", textAlign: "center", color: "var(--te-gray-4)" }}>Loading...</div>}>
      <RegistrationPageContent />
    </Suspense>
  );
}
