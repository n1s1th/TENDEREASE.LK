import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { OpeningSession, OpeningAttendance } from "@/lib/types/opening.types";
import { fetchOpeningSession, fetchAttendance, markAttendance, startOpeningSession, updateAttendanceApi, deleteAttendanceApi } from "@/lib/api/opening.api";

interface OpeningState {
  session: OpeningSession | null;
  attendance: OpeningAttendance[];
  isLoading: boolean;
  error: string | null;

  fetchSession: (tenderId: string) => Promise<void>;
  fetchAttendance: (sessionId: string) => Promise<void>;
  markAttendance: (sessionId: string, name: string, designation: string, email: string, organisation?: string, role?: string, officerId?: string) => Promise<void>;
  updateAttendance: (attendanceId: string, data: Partial<OpeningAttendance>) => Promise<void>;
  deleteAttendance: (attendanceId: string) => Promise<void>;
  startOpening: (sessionId: string) => Promise<void>;
}

export const useOpeningStore = create<OpeningState>()(
  devtools(
    (set, get) => ({
      session: null,
      attendance: [],
      isLoading: false,
      error: null,

      fetchSession: async (tenderId: string) => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetchOpeningSession(tenderId);
          set({ session: res.data, isLoading: false });
        } catch (err: any) {
          set({ error: err.message, isLoading: false, session: null });
        }
      },

      fetchAttendance: async (sessionId: string) => {
        set({ isLoading: true });
        try {
          const res = await fetchAttendance(sessionId);
          set({ attendance: res.data, isLoading: false });
        } catch (err: any) {
          set({ isLoading: false });
        }
      },

      markAttendance: async (sessionId: string, name: string, designation: string, email: string, organisation?: string, role?: string, officerIdFromForm?: string) => {
        set({ isLoading: true });
        try {
          const officerId = officerIdFromForm || "dev-officer-id-" + Math.random().toString(36).substr(2, 9);
          const newEntry: OpeningAttendance = {
            id: Math.random().toString(36).substr(2, 9),
            officerId,
            officerName: name,
            designation,
            email,
            attendanceTime: new Date().toISOString()
          };
          
          try {
            await markAttendance(sessionId, { officerId, officerName: name, designation, email, organisation, role });
            const res = await fetchAttendance(sessionId);
            set({ attendance: res.data, isLoading: false });
          } catch (e) {
            // Fallback for demo: add to local state if API fails
            set(state => ({ 
              attendance: [...state.attendance, newEntry],
              isLoading: false 
            }));
          }
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
        }
      },

      updateAttendance: async (attendanceId: string, data: Partial<OpeningAttendance>) => {
        const { session } = get();
        
        // Optimistic local update
        set(state => ({
          attendance: state.attendance.map(a => a.id === attendanceId ? { ...a, ...data } : a)
        }));

        // Call API if session exists
        if (session?.id) {
          try {
            const member = get().attendance.find(a => a.id === attendanceId);
            if (member) {
              await updateAttendanceApi(session.id, attendanceId, {
                officerId: member.officerId,
                officerName: data.officerName || member.officerName,
                designation: data.designation || member.designation,
                email: data.email || member.email,
              });
            }
          } catch (e) {
            console.log(`Update attendance ${attendanceId} via API failed, keeping local state`, e);
          }
        }
      },

      deleteAttendance: async (attendanceId: string) => {
        const { session } = get();
        
        // Optimistic local removal
        set(state => ({
          attendance: state.attendance.filter(a => a.id !== attendanceId)
        }));

        // Call API if session exists
        if (session?.id) {
          try {
            await deleteAttendanceApi(session.id, attendanceId);
          } catch (e) {
            console.log(`Delete attendance ${attendanceId} via API failed, keeping local state`, e);
          }
        }
      },

      startOpening: async (sessionId: string) => {
        set({ isLoading: true });
        try {
          try {
            const res = await startOpeningSession(sessionId);
            set({ session: res.data, isLoading: false });
          } catch (e) {
            // Fallback for demo: ensure session exists and is OPEN
            set(state => ({
              session: state.session 
                ? { ...state.session, status: 'OPEN' } 
                : { 
                    id: sessionId, 
                    tenderId: "DEMO-TENDER", 
                    status: 'OPEN', 
                    scheduledOpeningTime: new Date().toISOString(),
                    bidSubmissionDeadline: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
                    bidsCount: 0 
                  } as OpeningSession,
              isLoading: false
            }));
          }
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
        }
      }
    }),
    { name: "OpeningStore" }
  )
);
