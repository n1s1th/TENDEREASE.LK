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
  UserX
} from "lucide-react";
import { useOpeningStore } from "@/store/opening/opening.store";

export default function AttendanceSection() {
  const { attendance, markAttendance, updateAttendance, deleteAttendance, isLoading } = useOpeningStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isEditingMember, setIsEditingMember] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [newMember, setNewMember] = useState({ name: "", designation: "" });
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredAttendance = attendance.filter(a => 
    a.officerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.officerId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name || !newMember.designation) return;
    
    await markAttendance("TND-0000-SESSION", newMember.name, newMember.designation);
    setNewMember({ name: "", designation: "" });
    setIsAddingMember(false);
  };

  const handleEditMember = (member: any) => {
    setEditingMemberId(member.id);
    setNewMember({ name: member.officerName, designation: member.designation });
    setIsEditingMember(true);
    setOpenMenuId(null);
  };

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMemberId || !newMember.name || !newMember.designation) return;

    await updateAttendance(editingMemberId, { 
      officerName: newMember.name, 
      designation: newMember.designation 
    });
    
    setNewMember({ name: "", designation: "" });
    setIsEditingMember(false);
    setEditingMemberId(null);
  };

  const handleDeleteMember = async (id: string) => {
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

  return (
    <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm flex flex-col h-full relative">
      {/* Header */}
      <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-white rounded-t-[32px]">
        <div>
          <h3 className="text-[14px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            Committee Attendance <span className="text-[#953002] bg-orange-50 px-2.5 py-1 rounded-lg text-[11px]">{attendance.length} PRESENT</span>
          </h3>
          <p className="text-[13px] text-gray-500 mt-1 font-medium italic">Minimum 3 members required for quorum.</p>
        </div>
        
        <button 
          onClick={() => setIsAddingMember(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#953002]/5 text-[#953002] border border-[#953002]/10 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#953002]/10 transition-all shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          Mark Attendance
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-50">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Filter committee members..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[13px] font-bold text-gray-700 outline-none focus:ring-2 focus:ring-[#953002]/10 transition-all placeholder:text-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Attendance Table */}
      <div className="flex-1 overflow-visible">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-white border-b border-gray-50">
              <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] text-center w-[30%]">Committee Member</th>
              <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] text-center w-[20%]">Designation</th>
              <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] text-center w-[20%]">Status</th>
              <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] text-center w-[20%]">Time</th>
              <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] text-center w-[10%]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredAttendance.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <UserCheck className="w-10 h-10 text-gray-200" />
                    <p className="text-sm font-bold text-gray-300 italic tracking-wide">No attendance recorded yet...</p>
                  </div>
                </td>
              </tr>
            ) : filteredAttendance.map((member, idx) => (
              <tr key={member.id} className="hover:bg-gray-50/50 transition-all group">
                <td className="px-6 py-6">
                  <div className="flex items-center gap-4 justify-start pl-12">
                    <div className="w-11 h-11 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#953002] font-black text-[15px] shrink-0">
                      {member.officerName.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <p className="text-[14px] font-black text-gray-900 leading-tight uppercase tracking-tight whitespace-nowrap">{member.officerName}</p>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">MEMBER</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-6 text-center">
                  <span className="text-[14px] font-bold text-gray-500 uppercase tracking-tight">{member.designation || "NOT SPECIFIED"}</span>
                </td>
                <td className="px-6 py-6 text-center">
                  <div className="flex items-center justify-center gap-1.5 px-4 py-1.5 bg-green-50 rounded-xl border border-green-100 w-fit mx-auto">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-[11px] font-black text-green-700 uppercase tracking-widest">VERIFIED</span>
                  </div>
                </td>
                <td className="px-6 py-6 text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-800 font-mono text-[14px] font-bold">
                    <Clock className="w-4 h-4 text-[#953002]" />
                    {formatTime(member.attendanceTime)}
                  </div>
                </td>
                <td className="px-6 py-6 text-center">
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
                          idx >= filteredAttendance.length - 2 ? "bottom-full mb-2" : "top-full mt-2"
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Member Modal Overlay */}
      {mounted && isAddingMember && createPortal(
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] w-full max-w-[380px] shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-50 bg-[#F9FAFB]">
              <h3 className="text-lg font-black text-gray-900 tracking-tight">Manual Attendance</h3>
              <p className="text-xs text-gray-500 font-medium mt-1">Record a committee member present for this session.</p>
            </div>
            
            <form onSubmit={handleAddMember} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Member Name</label>
                <input 
                  autoFocus
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#953002]/10 transition-all"
                  placeholder="Enter full name..."
                  value={newMember.name}
                  onChange={e => setNewMember({...newMember, name: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Designation</label>
                <input 
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#953002]/10 transition-all"
                  placeholder="e.g. Technical Officer"
                  value={newMember.designation}
                  onChange={e => setNewMember({...newMember, designation: e.target.value})}
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsAddingMember(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-gray-200 font-bold text-[10px] uppercase tracking-wider text-gray-400 hover:bg-gray-50 transition-all"
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
          <div className="bg-white rounded-[32px] w-full max-w-[380px] shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-50 bg-[#F9FAFB]">
              <h3 className="text-lg font-black text-gray-900 tracking-tight">Edit Attendance</h3>
              <p className="text-xs text-gray-500 font-medium mt-1">Update committee member details for this session.</p>
            </div>
            
            <form onSubmit={handleUpdateMember} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Member Name</label>
                <input 
                  autoFocus
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#953002]/10 transition-all"
                  placeholder="Enter full name..."
                  value={newMember.name}
                  onChange={e => setNewMember({...newMember, name: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Designation</label>
                <input 
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#953002]/10 transition-all"
                  placeholder="e.g. Technical Officer"
                  value={newMember.designation}
                  onChange={e => setNewMember({...newMember, designation: e.target.value})}
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => {
                    setIsEditingMember(false);
                    setNewMember({ name: "", designation: "" });
                  }}
                  className="flex-1 py-3 px-4 rounded-xl border border-gray-200 font-bold text-[10px] uppercase tracking-wider text-gray-400 hover:bg-gray-50 transition-all"
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
