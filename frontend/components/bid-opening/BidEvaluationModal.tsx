"use client";

import React, { useState, useEffect } from "react";
import { X, ShieldCheck, AlertTriangle, FileText, CheckCircle2, DollarSign, Award, Percent } from "lucide-react";
import { evaluateBid } from "@/services/bid.service";

interface BidEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bid: any;
  onUpdate: (no: string, updates: any) => void;
}

export default function BidEvaluationModal({ isOpen, onClose, bid, onUpdate }: BidEvaluationModalProps) {
  const [technicalScore, setTechnicalScore] = useState("");
  const [financialScore, setFinancialScore] = useState("");
  const [status, setStatus] = useState("EVALUATED");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (bid) {
      setTechnicalScore(bid.technicalScore ? bid.technicalScore.toString() : "");
      setFinancialScore(bid.financialScore ? bid.financialScore.toString() : "");
      setStatus(bid.status || "EVALUATED");
      setNotes(bid.notes || "");
      setSuccess(false);
      setError("");
    }
  }, [bid]);

  if (!isOpen || !bid) return null;

  const bidData = bid.bidData || {};
  const boqItems = bidData.boqItems || [];
  const techComplianceMatrix = bidData.techComplianceMatrix || [];
  const bidSecurity = bidData.bidSecurity || {};

  // Gather uploaded files
  const documents = [
    { label: "Bid Security Certificate", url: bidSecurity.fileUrl },
    { label: "PCA 3 Certificate", url: bidData.pca3File },
    { label: "CIDA Certificate", url: bidData.cidaFile },
    { label: "CIDA History Book", url: bidData.cidaHistoryBookFile },
    { label: "Manufacturer Authorization Form", url: bidData.mafFile },
    { label: "Staff CVs Document", url: bidData.cvsFile },
    { label: "Execution Methodology", url: bidData.methodologyFile },
    { label: "Past Experience Records", url: bidData.pastExperienceFile },
    { label: "Gantt Chart / Schedule", url: bidData.ganttChartFile }
  ].filter(doc => doc.url);

  const handleSubmitEvaluation = async () => {
    setError("");
    setSuccess(false);

    const tScore = parseFloat(technicalScore);
    const fScore = parseFloat(financialScore);

    if (isNaN(tScore) || tScore < 0 || tScore > 100) {
      setError("Technical Score must be a number between 0 and 100.");
      return;
    }
    if (isNaN(fScore) || fScore < 0 || fScore > 100) {
      setError("Financial Score must be a number between 0 and 100.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await evaluateBid(bid.id, {
        technicalScore: tScore,
        financialScore: fScore,
        status,
        notes
      });

      if (res.success) {
        setSuccess(true);
        // Propagate updates up to sync lists
        onUpdate(bid.no, {
          technicalScore: tScore,
          financialScore: fScore,
          status,
          isFlagged: status === "FLAGGED",
          notes
        });
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        setError(res.message || "Failed to save evaluation.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while saving scores.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-black text-gray-3 uppercase tracking-widest">
                OFFICER EVALUATION WORKSPACE
              </span>
            </div>
            <h3 className="text-2xl font-black text-black-1 tracking-tight">
              Evaluate Bid Submission: {bid.ref}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-5 rounded-2xl transition-colors text-gray-3"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-8 space-y-8 overflow-y-auto flex-1 no-scrollbar">
          {error && (
            <div className="p-4 bg-error/10 border border-error/20 text-error rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertTriangle size={16} /> {error}
            </div>
          )}
          {success && (
            <div className="p-4 bg-success/10 border border-success/20 text-success rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 size={16} /> Evaluation saved successfully!
            </div>
          )}

          {/* Bid Summary & Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-5 rounded-2xl p-4 border border-gray-100">
              <span className="text-[9px] font-black text-gray-3 uppercase tracking-wider block mb-1">Bidder Name</span>
              <span className="text-sm font-bold text-black-2">{bid.name}</span>
            </div>
            <div className="bg-gray-5 rounded-2xl p-4 border border-gray-100">
              <span className="text-[9px] font-black text-gray-3 uppercase tracking-wider block mb-1">Quoted Price</span>
              <span className="text-sm font-black text-[#a03d11]">{bid.amount}</span>
            </div>
            <div className="bg-gray-5 rounded-2xl p-4 border border-gray-100">
              <span className="text-[9px] font-black text-gray-3 uppercase tracking-wider block mb-1">Submitted Date</span>
              <span className="text-sm font-bold text-black-2">{bid.time}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left side: Submitted Documents & Specs Matrix */}
            <div className="space-y-6">
              {/* Document List */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-gray-3 uppercase tracking-widest">Submitted Verification Documents</h4>
                <div className="border border-gray-100 rounded-2xl p-4 space-y-2.5">
                  {documents.length === 0 ? (
                    <p className="text-xs text-gray-3 font-semibold italic">No documents uploaded with this bid.</p>
                  ) : (
                    documents.map((doc, idx) => (
                      <div key={idx} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                        <span className="text-xs font-bold text-black-2">{doc.label}</span>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs font-black text-primary hover:text-primary/80 transition-colors uppercase tracking-wider"
                        >
                          <FileText size={14} /> Open Document
                        </a>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Specifications compliance matrix if present */}
              {techComplianceMatrix.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-gray-3 uppercase tracking-widest">Technical compliance Matrix</h4>
                  <div className="border border-gray-100 rounded-2xl overflow-hidden">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead>
                        <tr className="bg-gray-5 border-b border-gray-100 font-black text-gray-3 uppercase">
                          <th className="p-3">Specification Criteria</th>
                          <th className="p-3 w-32">Compliance</th>
                          <th className="p-3">Deviation Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {techComplianceMatrix.map((item: any, idx: number) => (
                          <tr key={idx} className="border-b border-gray-50 font-semibold text-black-2">
                            <td className="p-3">{item.criterion}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded font-black text-[10px] uppercase ${
                                item.compliance === "Compliant" ? "bg-success/10 text-success" : "bg-error/10 text-error"
                              }`}>
                                {item.compliance}
                              </span>
                            </td>
                            <td className="p-3 text-gray-2">{item.deviation || "None"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Right side: Priced e-BOQ Items */}
            <div className="space-y-6">
              <div className="space-y-3">
                <h4 className="text-xs font-black text-gray-3 uppercase tracking-widest">Priced e-BOQ Schedule</h4>
                <div className="border border-gray-100 rounded-2xl overflow-hidden max-h-[300px] overflow-y-auto no-scrollbar">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="bg-gray-5 border-b border-gray-100 font-black text-gray-3 uppercase sticky top-0">
                        <th className="p-3">Item Description</th>
                        <th className="p-3 w-16 text-center">Unit</th>
                        <th className="p-3 w-16 text-right">Qty</th>
                        <th className="p-3 w-28 text-right">Rate</th>
                        <th className="p-3 w-28 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {boqItems.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-gray-3 font-semibold italic">No BOQ items specified.</td>
                        </tr>
                      ) : (
                        boqItems.map((item: any, idx: number) => (
                          <tr key={idx} className="border-b border-gray-50 font-semibold text-black-2">
                            <td className="p-3">{item.description}</td>
                            <td className="p-3 text-center text-gray-2">{item.unit}</td>
                            <td className="p-3 text-right">{item.quantity}</td>
                            <td className="p-3 text-right">LKR {Number(item.rate || 0).toLocaleString()}</td>
                            <td className="p-3 text-right font-bold">LKR {Number(item.total || 0).toLocaleString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Scoring and evaluation inputs */}
          <div className="space-y-4 pt-6 border-t border-gray-100">
            <h4 className="text-xs font-black text-gray-3 uppercase tracking-widest">Evaluation & Scoring Parameters</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-3 uppercase tracking-wider flex items-center gap-1">
                  <Percent size={14} className="text-primary" /> Technical Score (0-100) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={technicalScore}
                  onChange={(e) => setTechnicalScore(e.target.value)}
                  placeholder="Enter score"
                  className="w-full border border-gray-200 rounded-xl py-3 px-4 text-sm font-semibold text-black-2 focus:border-primary focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-3 uppercase tracking-wider flex items-center gap-1">
                  <DollarSign size={14} className="text-[#a03d11]" /> Financial Score (0-100) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={financialScore}
                  onChange={(e) => setFinancialScore(e.target.value)}
                  placeholder="Enter score"
                  className="w-full border border-gray-200 rounded-xl py-3 px-4 text-sm font-semibold text-black-2 focus:border-primary focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-3 uppercase tracking-wider flex items-center gap-1">
                  <Award size={14} className="text-success" /> Evaluation Status *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl py-3 px-4 text-sm font-semibold text-black-2 focus:border-primary focus:outline-none"
                >
                  <option value="EVALUATED">EVALUATED</option>
                  <option value="COMPLIANT">COMPLIANT</option>
                  <option value="NON_COMPLIANT">NON_COMPLIANT</option>
                  <option value="FLAGGED">FLAGGED</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-3 uppercase tracking-wider">Officer Vetting Remarks / Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Specify reasons for scoring, compliance flags, or regulatory findings..."
                rows={3}
                className="w-full border border-gray-200 rounded-xl py-3.5 px-4 text-xs font-semibold text-black-2 focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Footer controls */}
        <div className="px-8 py-5 bg-white border-t border-gray-100 flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-200 hover:bg-gray-5 rounded-xl text-xs font-bold text-black-2 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmitEvaluation}
            disabled={submitting}
            className="px-8 py-3 bg-[#a03d11] text-white hover:bg-[#8a330e] disabled:bg-[#a03d11]/50 rounded-xl text-xs font-black uppercase tracking-wider transition-all hover:shadow-lg active:scale-95"
          >
            {submitting ? "Saving Scores..." : "Submit Evaluation Scores"}
          </button>
        </div>
      </div>
    </div>
  );
}
