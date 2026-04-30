"use client";

import React from "react";
import { UserPlus, Edit2, Trash2, FileDown, CheckCircle2, X, AlertTriangle, ChevronDown, ShieldCheck } from "lucide-react";

import { useOpeningStore } from "@/store/opening/opening.store";
import { useState } from "react";

interface AttendanceSectionProps {
  sessionId: string;
}

export default function AttendanceSection({ sessionId }: AttendanceSectionProps) {
  const { session, attendance, markAttendance, updateAttendance, deleteAttendance, isLoading } = useOpeningStore();
  const isClosed = session?.status === 'CLOSED';
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    designation: "",
    org: "",
    id: "",
    role: "Member"
  });
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const roles = ["Member", "Chair", "Secretary", "Observer"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields are filled
    if (!formData.name || !formData.designation || !formData.org || !formData.id) {
      setShowErrors(true);
      return;
    }

    setShowErrors(false);

    if (sessionId) {
      await markAttendance(
        sessionId, 
        formData.name, 
        formData.designation, 
        formData.org, 
        formData.role,
        formData.id
      );
      setFormData({ name: "", designation: "", org: "", id: "", role: "Member" });
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-4">
      {/* Mark Attendance Form */}
      <div className="xl:col-span-3 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm flex flex-col h-fit sticky top-4">
        <div className="mb-6">
          <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">MARK ATTENDANCE</h3>
          <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">AUTO-TIMESTAMPED ON SUBMISSION</p>
        </div>
        
        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-gray-500 ml-1 mb-1 block">Full Name *</label>
            <input 
              type="text" 
              required
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full bg-white border rounded-[8px] px-[16px] py-[10px] text-[15px] font-medium text-gray-900 placeholder:text-gray-300 outline-none transition-all focus:ring-1 ${showErrors && !formData.name.trim() ? 'border-[#EB5757] focus:ring-[#EB5757]' : 'border-gray-400 focus:ring-[#953002]'}`}
              style={showErrors && !formData.name.trim() ? { borderColor: '#EB5757', boxShadow: '0 0 0 1px #EB5757' } : {}}
            />
            {showErrors && !formData.name.trim() && (
              <p className="text-[11px] text-[#EB5757] font-medium ml-1">cannot leave field empty</p>
            )}
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-gray-500 ml-1 mb-1 block">Designation / Title *</label>
            <input 
              type="text" 
              required
              placeholder="Junior Officer"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              className={`w-full bg-white border rounded-[8px] px-[16px] py-[10px] text-[15px] font-medium text-gray-900 placeholder:text-gray-300 outline-none transition-all focus:ring-1 ${showErrors && !formData.designation.trim() ? 'border-[#EB5757] focus:ring-[#EB5757]' : 'border-gray-400 focus:ring-[#953002]'}`}
              style={showErrors && !formData.designation.trim() ? { borderColor: '#EB5757', boxShadow: '0 0 0 1px #EB5757' } : {}}
            />
            {showErrors && !formData.designation.trim() && (
              <p className="text-[11px] text-[#EB5757] font-medium ml-1">cannot leave field empty</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-gray-500 ml-1 mb-1 block">Organisation</label>
              <input 
                type="text" 
                required
                placeholder="IT Division"
                value={formData.org}
                onChange={(e) => setFormData({ ...formData, org: e.target.value })}
                className={`w-full bg-white border rounded-[8px] px-[16px] py-[10px] text-[15px] font-medium text-gray-900 placeholder:text-gray-300 outline-none transition-all focus:ring-1 ${showErrors && !formData.org.trim() ? 'border-[#EB5757] focus:ring-[#EB5757]' : 'border-gray-400 focus:ring-[#953002]'}`}
                style={showErrors && !formData.org.trim() ? { borderColor: '#EB5757', boxShadow: '0 0 0 1px #EB5757' } : {}}
              />
              {showErrors && !formData.org.trim() && (
                <p className="text-[11px] text-[#EB5757] font-medium ml-1">cannot leave field empty</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-gray-500 ml-1 mb-1 block">ID / Badge No.</label>
              <input 
                type="text" 
                required
                placeholder="01"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                className={`w-full bg-white border rounded-[8px] px-[16px] py-[10px] text-[15px] font-medium text-gray-900 placeholder:text-gray-300 outline-none transition-all focus:ring-1 ${showErrors && !formData.id.trim() ? 'border-[#EB5757] focus:ring-[#EB5757]' : 'border-gray-400 focus:ring-[#953002]'}`}
                style={showErrors && !formData.id.trim() ? { borderColor: '#EB5757', boxShadow: '0 0 0 1px #EB5757' } : {}}
              />
              {showErrors && !formData.id.trim() && (
                <p className="text-[11px] text-[#EB5757] font-medium ml-1">cannot leave field empty</p>
              )}
            </div>
          </div>
          
          <div className="space-y-1.5 relative">
            <label className="text-[13px] font-medium text-gray-500 ml-1 mb-1 block">Role in Opening *</label>
            <div 
              onClick={() => setIsRoleOpen(!isRoleOpen)}
              className={`w-full bg-white border rounded-[8px] px-[16px] py-[10px] text-[15px] font-medium text-gray-900 outline-none transition-all cursor-pointer flex justify-between items-center focus:ring-1 ${showErrors && !formData.role ? 'border-[#EB5757] focus:ring-[#EB5757]' : 'border-gray-400 focus:ring-[#953002]'}`}
              style={showErrors && !formData.role ? { borderColor: '#EB5757', boxShadow: '0 0 0 1px #EB5757' } : {}}
            >
              {formData.role}
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isRoleOpen ? 'rotate-180' : ''}`} />
            </div>
            {showErrors && !formData.role && (
              <p className="text-[11px] text-[#EB5757] font-medium ml-1">cannot leave field empty</p>
            )}

            {isRoleOpen && (
              <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-[8px] mt-1 shadow-xl z-[50] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {roles.map((role) => (
                  <div 
                    key={role}
                    onClick={() => {
                      setFormData({ ...formData, role });
                      setIsRoleOpen(false);
                    }}
                    className={`px-[16px] py-[8px] text-[15px] font-medium transition-colors cursor-pointer ${
                      formData.role === role ? 'bg-[#953002] text-white' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {role}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#953002] text-white py-4 rounded-2xl font-black text-[13px] tracking-wider uppercase mt-4 hover:bg-[#782402] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#953002]/20 disabled:opacity-50"
          >
            {isLoading ? "Marking..." : "Mark Attendance"}
          </button>
        </form>
        
        <p className="text-[12px] text-center font-medium text-gray-400 leading-relaxed mt-8 px-2">
          Attendance entries are timestamped automatically and cannot be edited once saved. 
          Only the Committee Chair may delete an erroneous entry.
        </p>
      </div>

      {/* Attendance Log Table */}
      <div className="xl:col-span-9 bg-white rounded-[32px] border border-gray-100 p-6 shadow-sm flex flex-col min-h-[500px]">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3 uppercase">
              ATTENDANCE LOG
              <span className="bg-[#FFF1F2] text-[#953002] text-[12px] font-black px-3 py-1 rounded-full border border-[#953002]/20">
                {attendance.length} ENTRIES
              </span>
              {isClosed ? (
                <span className="bg-gray-100 text-gray-500 text-[12px] font-black px-3 py-1 rounded-full border border-gray-200 flex items-center gap-1.5 uppercase tracking-widest">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  SESSION CONCLUDED
                </span>
              ) : null}
            </h3>
            <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">VERIFIED COMMITTEE PRESENCE SUMMARY</p>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#9A3B12] text-white text-[13px] font-black uppercase tracking-wider">
                <th className="py-4 px-6 rounded-tl-lg">ID NO</th>
                <th className="py-4 px-4">FULL NAME</th>
                <th className="py-4 px-4 text-center">DESIGNATION</th>
                <th className="py-4 px-4 text-center">ORGANISATION</th>
                <th className="py-4 px-4 text-center">ROLE</th>
                <th className="py-4 px-4 text-center rounded-tr-lg">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {attendance.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-20 text-gray-500 font-bold italic">No attendance records found...</td>
                </tr>
              ) : attendance.map((row, idx) => (
                <tr key={row.id} className={`border-b border-gray-100 hover:bg-gray-50/80 transition-all ${idx % 2 === 0 ? 'bg-white' : 'bg-[#F2F4F7]'}`}>
                  <td className="py-4 px-6">
                    <div className="font-bold text-sm text-gray-900">{row.officerId}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-bold text-sm text-gray-900 uppercase">{row.officerName}</div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="text-sm font-bold text-gray-700 uppercase">{row.designation}</div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="text-sm font-bold text-gray-600 uppercase">{row.organisation || "—"}</div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="text-sm font-bold text-gray-600 uppercase">{row.role || "MEMBER"}</div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => setEditingRecord(row)}
                        className="p-2 bg-[#1A1D1F] text-white rounded-lg hover:bg-black transition-all shadow-sm"
                        title="Edit Entry"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => setDeletingId(row.id)}
                        className="p-2 bg-[#EF4444] text-white rounded-lg hover:bg-red-600 transition-all shadow-sm"
                        title="Delete Entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-auto pt-10">
        {attendance.length < 3 && (
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-[#10B981] rounded-full animate-pulse shadow-[0_0_10px_#10B981]" />
            <span className="text-[13px] font-bold text-[#10B981] uppercase tracking-widest flex items-center gap-2">
              QUORUM VERIFIED: <span className="text-gray-900 font-bold">MINIMUM 3 MEMBERS REQUIRED</span>
            </span>
          </div>
        )}
        
        <button 
          onClick={() => alert("The document will be downloaded shortly.")}
          className="bg-[#953002] text-white px-5 py-2.5 rounded-2xl font-black text-[12px] tracking-wider uppercase hover:bg-[#782402] transition-all flex items-center gap-2 shadow-lg shadow-[#953002]/20 ml-auto"
        >
          <FileDown className="w-4 h-4" />
          Generate Opening Report
        </button>
        </div>
      </div>

      {/* Edit Modal */}
      {editingRecord && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setEditingRecord(null)}
              className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
            
            <h3 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">Edit Attendance</h3>
            <p className="text-xs font-bold text-gray-400 mb-8 uppercase tracking-widest">Update committee member details</p>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-gray-500 ml-1 mb-1 block">Full Name</label>
                <input 
                  type="text" 
                  value={editingRecord.officerName}
                  onChange={(e) => setEditingRecord({ ...editingRecord, officerName: e.target.value })}
                  className="w-full bg-white border border-gray-400 rounded-[8px] px-[16px] py-[10px] text-[15px] font-medium text-gray-900 outline-none focus:ring-1 focus:ring-[#953002] transition-all"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-gray-500 ml-1 mb-1 block">Designation</label>
                <input 
                  type="text" 
                  value={editingRecord.designation}
                  onChange={(e) => setEditingRecord({ ...editingRecord, designation: e.target.value })}
                  className="w-full bg-white border border-gray-400 rounded-[8px] px-[16px] py-[10px] text-[15px] font-medium text-gray-900 outline-none focus:ring-1 focus:ring-[#953002] transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-gray-500 ml-1 mb-1 block">Organisation</label>
                  <input 
                    type="text" 
                    value={editingRecord.organisation || ""}
                    onChange={(e) => setEditingRecord({ ...editingRecord, organisation: e.target.value })}
                    className="w-full bg-white border border-gray-400 rounded-[8px] px-[16px] py-[10px] text-[15px] font-medium text-gray-900 outline-none focus:ring-1 focus:ring-[#953002] transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-gray-500 ml-1 mb-1 block">Role</label>
                  <select 
                    value={editingRecord.role || "Member"}
                    onChange={(e) => setEditingRecord({ ...editingRecord, role: e.target.value })}
                    className="w-full bg-white border border-gray-400 rounded-[8px] px-[16px] py-[10px] text-[15px] font-medium text-gray-900 outline-none focus:ring-1 focus:ring-[#953002] transition-all cursor-pointer"
                  >
                    <option>Member</option>
                    <option>Chair</option>
                    <option>Secretary</option>
                    <option>Observer</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex gap-3">
              <button 
                onClick={() => setEditingRecord(null)}
                className="flex-1 py-3.5 rounded-2xl font-black text-[12px] tracking-wider uppercase text-gray-500 bg-gray-50 hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  await updateAttendance(editingRecord.id, {
                    officerName: editingRecord.officerName,
                    designation: editingRecord.designation,
                    organisation: editingRecord.organisation,
                    role: editingRecord.role
                  });
                  setEditingRecord(null);
                }}
                className="flex-1 py-3.5 rounded-2xl font-black text-[12px] tracking-wider uppercase bg-[#953002] text-white hover:bg-[#782402] transition-all shadow-lg shadow-[#953002]/20"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-sm p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            
            <h3 className="text-xl font-black text-gray-900 mb-2 text-center uppercase tracking-tight">Confirm Deletion</h3>
            <p className="text-[13px] font-medium text-gray-500 text-center mb-8">
              Are you sure you want to remove this attendance entry? This action cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setDeletingId(null)}
                className="flex-1 py-3.5 rounded-2xl font-black text-[12px] tracking-wider uppercase text-gray-500 bg-gray-50 hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  await deleteAttendance(deletingId);
                  setDeletingId(null);
                }}
                className="flex-1 py-3.5 rounded-2xl font-black text-[12px] tracking-wider uppercase bg-red-500 text-white hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
