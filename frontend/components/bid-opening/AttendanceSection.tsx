"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { 
  UserCheck, 
  Search, 
  MoreVertical, 
  Clock, 
  CheckCircle2, 
  Plus,
  Edit2,
  Trash2,
  UserPlus,
  UserX,
  X,
  Lock,
  ChevronDown,
  Check
} from "lucide-react";
import { useOpeningStore } from "@/store/opening/opening.store";

const DESIGNATION_OPTIONS = [
  "Committee Chairman",
  "Technical Evaluation Member",
  "Financial Evaluation Member",
  "Procurement Officer",
  "Committee Secretary",
  "Observer"
];

export default function AttendanceSection() {
  const { session, attendance, markAttendance, updateAttendance, deleteAttendance, isLoading } = useOpeningStore();
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isEditingMember, setIsEditingMember] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [newMember, setNewMember] = useState({ name: "", designation: "", email: "" });
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isDesignationOpen, setIsDesignationOpen] = useState(false);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const menuRef = useRef<HTMLDivElement>(null);
  const designationRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close menus
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
      if (designationRef.current && !designationRef.current.contains(event.target as Node)) {
        setIsDesignationOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isSessionUnlocked = session?.status === 'OPEN' || session?.status === 'CLOSED';

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name || !newMember.designation || !newMember.email) return;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newMember.email)) {
      alert("Please enter a valid email address!");
      return;
    }

    const emailExists = attendance.some(a => a.email?.toLowerCase() === newMember.email.toLowerCase());
    if (emailExists) {
      alert("A member with this email address has already marked attendance!");
      return;
    }
    
    await markAttendance("TND-0000-SESSION", newMember.name, newMember.designation, newMember.email);
    setNewMember({ name: "", designation: "", email: "" });
    setIsAddingMember(false);
  };

  const handleEditMember = (member: any) => {
    if (isSessionUnlocked) {
      alert("Records cannot be edited after the session has been unlocked!");
      return;
    }
    setEditingMemberId(member.id);
    setNewMember({ 
      name: member.officerName, 
      designation: member.designation, 
      email: member.email || "" 
    });
    setIsEditingMember(true);
    setOpenMenuId(null);
  };

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMemberId || !newMember.name || !newMember.designation || !newMember.email) return;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newMember.email)) {
      alert("Please enter a valid email address!");
      return;
    }

    const emailExists = attendance.some(a => a.email?.toLowerCase() === newMember.email.toLowerCase() && a.id !== editingMemberId);
    if (emailExists) {
      alert("A member with this email address has already marked attendance!");
      return;
    }

    await updateAttendance(editingMemberId, { 
      officerName: newMember.name, 
      designation: newMember.designation,
      email: newMember.email
    });
    
    setNewMember({ name: "", designation: "", email: "" });
    setIsEditingMember(false);
    setEditingMemberId(null);
  };

  const handleDeleteMember = async (id: string) => {
    if (isSessionUnlocked) {
      alert("Records cannot be deleted after the session has been unlocked!");
      return;
    }
    if (confirm("Are you sure you want to remove this member?")) {
      await deleteAttendance(id);
      setOpenMenuId(null);
    }
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return "--:--:--";
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-GB', { hour12: true });
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "-- --- ----";
    const date = new Date(isoString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full relative">
      {/* Header */}
      <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-white rounded-t-2xl">
        <div>
          <h3 className="text-[14px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
            Committee Attendance <span className="text-[#953002] bg-orange-50 px-2.5 py-1 rounded-lg text-[11px]">{attendance.length} PRESENT</span>
          </h3>
          <p className="text-[13px] text-gray-500 mt-2.5 font-medium italic">Minimum 3 members required for quorum.</p>
        </div>
        
        <button 
          onClick={() => {
            if (isSessionUnlocked) return;
            setIsAddingMember(true);
          }}
          disabled={isSessionUnlocked}
          className={`flex items-center gap-2 px-6 py-3 border rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-sm ${
            isSessionUnlocked
              ? "bg-gray-100 text-gray-400 border-transparent cursor-not-allowed"
              : "bg-[#953002]/5 text-[#953002] border-[#953002]/10 hover:bg-[#953002]/10"
          }`}
        >
          <UserPlus className="w-4 h-4" />
          Mark Attendance
        </button>
      </div>

      {/* Attendance Table */}
      <div className="flex-1 overflow-visible">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#9A3B12] text-white text-[13px] font-black uppercase tracking-wider">
              <th className="py-4 px-6 rounded-tl-lg text-center w-[25%] align-middle">Committee Member</th>
              <th className="py-4 px-6 text-center w-[18%] align-middle">Designation</th>
              <th className="py-4 px-6 text-center w-[14%] align-middle">Status</th>
              <th className="py-4 px-6 text-center w-[18%] align-middle">Date</th>
              <th className="py-4 px-6 text-center w-[20%] align-middle">Time</th>
              <th className="py-4 px-6 rounded-tr-lg text-center w-[5%] align-middle">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {attendance.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-20 text-center align-middle">
                  <div className="flex flex-col items-center gap-3">
                    <UserCheck className="w-10 h-10 text-gray-200" />
                    <p className="text-sm font-bold text-gray-300 italic tracking-wide">No attendance recorded yet...</p>
                  </div>
                </td>
              </tr>
            ) : attendance.map((member, idx) => (
              <tr key={member.id} className="hover:bg-gray-50/50 transition-all group">
                <td className="px-6 py-6 text-left align-middle">
                  <div className="flex items-center gap-4 justify-start pl-6">
                    <div className="w-11 h-11 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#953002] font-black text-[15px] shrink-0">
                      {member.officerName.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <p className="text-[14px] font-black text-gray-900 leading-tight uppercase tracking-tight whitespace-nowrap">{member.officerName}</p>
                      <p className="text-[11px] font-medium text-gray-400 lowercase mt-0.5">{member.email || "no-email@tenderease.lk"}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-6 align-middle" style={{ textAlign: 'center' }}>
                  <span className="text-[11px] font-black text-black uppercase tracking-wider">{member.designation || "NOT SPECIFIED"}</span>
                </td>
                <td className="px-6 py-6 text-center align-middle">
                  <div className="flex items-center justify-center gap-1.5 px-4 py-1.5 bg-green-50 rounded-xl border border-green-100 w-fit mx-auto">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-[11px] font-black text-green-700 uppercase tracking-widest">VERIFIED</span>
                  </div>
                </td>
                <td className="px-6 py-6 text-center align-middle">
                  <span className="text-[13px] font-bold text-gray-600 whitespace-nowrap">{formatDate(member.attendanceTime)}</span>
                </td>
                <td className="px-6 py-6 text-center align-middle">
                  <div className="flex items-center justify-center gap-2 text-gray-800 font-mono text-[13px] font-bold whitespace-nowrap">
                    <Clock className="w-3.5 h-3.5 text-[#953002]" />
                    {formatTime(member.attendanceTime)}
                  </div>
                </td>
                <td className="px-6 py-6 text-center align-middle">
                  {isSessionUnlocked ? (
                    <div className="flex justify-center text-gray-300" title="Attendance locked after session unlock">
                      <Lock className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="relative flex justify-center">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === member.id ? null : member.id);
                        }}
                        className={`p-2 rounded-xl transition-all ${
                          openMenuId === member.id 
                            ? "bg-gray-100 text-gray-900" 
                            : "text-gray-900 hover:bg-gray-100"
                        }`}
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {openMenuId === member.id && (
                        <div 
                          ref={menuRef}
                          className={`absolute left-0 w-40 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[100] py-2 animate-in fade-in zoom-in-95 duration-200 ${
                            idx >= attendance.length - 2 ? "bottom-full mb-2" : "top-full mt-2"
                          }`}
                        >
                          <button 
                            onClick={() => handleEditMember(member)}
                            className="w-full px-4 py-2 text-left text-[13px] font-bold text-gray-700 hover:bg-[#953002]/5 hover:text-[#953002] transition-colors flex items-center gap-3"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit Record
                          </button>
                          <button 
                            onClick={() => {
                              handleDeleteMember(member.id);
                            }}
                            className="w-full px-4 py-2 text-left text-[13px] font-bold text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center gap-3"
                          >
                            <UserX className="w-4 h-4" />
                            Remove Member
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Member Modal Overlay */}
      {mounted && isAddingMember && createPortal(
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] w-full max-w-[380px] shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200 overflow-visible relative">
            <div className="py-4 px-6 border-b border-gray-50 bg-[#F9FAFB] flex justify-between items-center rounded-t-[32px]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#953002]/10 flex items-center justify-center shrink-0">
                  <UserPlus className="w-5 h-5 text-[#953002]" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 tracking-tight">Manual Attendance</h3>
                  <p className="text-xs text-gray-500 font-medium mt-1">Record a committee member present for this session.</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsAddingMember(false)}
                className="p-1.5 hover:bg-gray-200/60 rounded-xl transition-colors text-gray-400 hover:text-gray-600 shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddMember} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-black uppercase tracking-widest ml-1">Member Name</label>
                <input 
                  autoFocus
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#953002]/10 transition-all text-gray-800"
                  placeholder="Enter full name..."
                  value={newMember.name}
                  onChange={e => setNewMember({...newMember, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-black uppercase tracking-widest ml-1">Email Address</label>
                <input 
                  type="email"
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#953002]/10 transition-all text-gray-800"
                  placeholder="name@tenderease.lk"
                  value={newMember.email}
                  onChange={e => setNewMember({...newMember, email: e.target.value})}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-black uppercase tracking-widest ml-1">Designation</label>
                <div className="relative" ref={designationRef}>
                  <button
                    type="button"
                    onClick={() => setIsDesignationOpen(!isDesignationOpen)}
                    className={`w-full border rounded-xl px-4 py-3 text-left flex justify-between items-center outline-none focus:ring-2 focus:ring-[#953002]/10 transition-all ${
                      newMember.designation 
                        ? "bg-white border-gray-200 text-gray-800 text-sm font-semibold" 
                        : "bg-gray-50 border-gray-200 text-gray-400 text-sm font-medium hover:bg-gray-50"
                    }`}
                  >
                    <span>
                      {newMember.designation || "Select designation..."}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isDesignationOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isDesignationOpen && (
                    <div className="absolute right-0 bottom-full mb-1.5 w-[260px] bg-white rounded-2xl border border-gray-100 shadow-xl z-[1000] p-1.5 max-h-48 overflow-y-auto scrollbar-none animate-in fade-in slide-in-from-bottom-2 duration-200">
                      {DESIGNATION_OPTIONS.map((opt, i) => {
                        const isSelected = newMember.designation === opt;
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              setNewMember({ ...newMember, designation: opt });
                              setIsDesignationOpen(false);
                            }}
                            className={`w-full px-4 py-2.5 text-left text-sm font-medium rounded-xl transition-all flex items-center justify-between ${
                              isSelected 
                                ? 'bg-[#953002]/5 text-[#953002] font-semibold' 
                                : 'text-gray-700 hover:bg-[#953002]/5 hover:text-[#953002]'
                            }`}
                          >
                            <span>{opt}</span>
                            {isSelected && <Check className="w-4 h-4 text-[#953002]" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsAddingMember(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-gray-300 font-bold text-[10px] uppercase tracking-wider text-gray-600 hover:bg-gray-50 hover:text-gray-800 hover:border-gray-400 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="flex-[1.5] py-3 px-4 rounded-xl bg-[#953002] text-white font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-[#953002]/20 hover:bg-[#7a2702] transition-all disabled:opacity-50"
                >
                  {isLoading ? "Recording..." : "Record Presence"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Edit Member Modal Overlay */}
      {mounted && isEditingMember && createPortal(
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] w-full max-w-[380px] shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200 overflow-visible relative">
            <div className="py-4 px-6 border-b border-gray-50 bg-[#F9FAFB] flex justify-between items-center rounded-t-[32px]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#953002]/10 flex items-center justify-center shrink-0">
                  <Edit2 className="w-5 h-5 text-[#953002]" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 tracking-tight">Edit Attendance</h3>
                  <p className="text-xs text-gray-500 font-medium mt-1">Update committee member details for this session.</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setIsEditingMember(false);
                  setNewMember({ name: "", designation: "", email: "" });
                }}
                className="p-1.5 hover:bg-gray-200/60 rounded-xl transition-colors text-gray-400 hover:text-gray-600 shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateMember} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-black uppercase tracking-widest ml-1">Member Name</label>
                <input 
                  autoFocus
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#953002]/10 transition-all text-gray-800"
                  placeholder="Enter full name..."
                  value={newMember.name}
                  onChange={e => setNewMember({...newMember, name: e.target.value})}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-black uppercase tracking-widest ml-1">Email Address</label>
                <input 
                  type="email"
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#953002]/10 transition-all text-gray-800"
                  placeholder="name@tenderease.lk"
                  value={newMember.email}
                  onChange={e => setNewMember({...newMember, email: e.target.value})}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-black uppercase tracking-widest ml-1">Designation</label>
                <div className="relative" ref={designationRef}>
                  <button
                    type="button"
                    onClick={() => setIsDesignationOpen(!isDesignationOpen)}
                    className={`w-full border rounded-xl px-4 py-3 text-left flex justify-between items-center outline-none focus:ring-2 focus:ring-[#953002]/10 transition-all ${
                      newMember.designation 
                        ? "bg-white border-gray-200 text-gray-800 text-sm font-semibold" 
                        : "bg-gray-50 border-gray-200 text-gray-400 text-sm font-medium hover:bg-gray-50"
                    }`}
                  >
                    <span>
                      {newMember.designation || "Select designation..."}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isDesignationOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isDesignationOpen && (
                    <div className="absolute right-0 bottom-full mb-1.5 w-[260px] bg-white rounded-2xl border border-gray-100 shadow-xl z-[1000] p-1.5 max-h-48 overflow-y-auto scrollbar-none animate-in fade-in slide-in-from-bottom-2 duration-200">
                      {DESIGNATION_OPTIONS.map((opt, i) => {
                        const isSelected = newMember.designation === opt;
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              setNewMember({ ...newMember, designation: opt });
                              setIsDesignationOpen(false);
                            }}
                            className={`w-full px-4 py-2.5 text-left text-sm font-medium rounded-xl transition-all flex items-center justify-between ${
                              isSelected 
                                ? 'bg-[#953002]/5 text-[#953002] font-semibold' 
                                : 'text-gray-700 hover:bg-[#953002]/5 hover:text-[#953002]'
                            }`}
                          >
                            <span>{opt}</span>
                            {isSelected && <Check className="w-4 h-4 text-[#953002]" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => {
                    setIsEditingMember(false);
                    setNewMember({ name: "", designation: "", email: "" });
                  }}
                  className="flex-1 py-3 px-4 rounded-xl border border-gray-300 font-bold text-[10px] uppercase tracking-wider text-gray-600 hover:bg-gray-50 hover:text-gray-800 hover:border-gray-400 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="flex-[1.5] py-3 px-4 rounded-xl bg-[#953002] text-white font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-[#953002]/20 hover:bg-[#7a2702] transition-all disabled:opacity-50"
                >
                  {isLoading ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
