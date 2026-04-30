import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { OpeningSession, OpeningAttendance } from "@/lib/types/opening.types";
import { fetchOpeningSession, fetchAttendance, markAttendance, startOpeningSession } from "@/lib/api/opening.api";

interface OpeningState {
  session: OpeningSession | null;
  attendance: OpeningAttendance[];
  isLoading: boolean;
  error: string | null;

  fetchSession: (tenderId: string) => Promise<void>;
  fetchAttendance: (sessionId: string) => Promise<void>;
  markAttendance: (sessionId: string, name: string, designation: string, organisation?: string, role?: string, officerId?: string) => Promise<void>;
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
          set({ error: err.message, isLoading: false });
        }
      },

      fetchAttendance: async (sessionId: string) => {
        set({ isLoading: true });
        try {
          const res = await fetchAttendance(sessionId);
          set({ attendance: res.data, isLoading: false });
        } catch (err: any) {
          // Keep dummy data if fetch fails
          set({ isLoading: false });
        }
      },

      markAttendance: async (sessionId: string, name: string, designation: string, organisation?: string, role?: string, officerIdFromForm?: string) => {
        set({ isLoading: true });
        try {
          const officerId = officerIdFromForm || "dev-officer-id-" + Math.random().toString(36).substr(2, 9);
          const newEntry: OpeningAttendance = {
            id: Math.random().toString(36).substr(2, 9),
            officerId,
            officerName: name,
            designation,
            organisation,
            role,
            attendanceTime: new Date().toISOString()
          };
          
          try {
            await markAttendance(sessionId, { officerId, officerName: name, designation, organisation, role });
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
        // For demo: update local state
        set(state => ({
          attendance: state.attendance.map(a => a.id === attendanceId ? { ...a, ...data } : a)
        }));
        
        // In real app, call API here
        console.log(`Updating attendance ${attendanceId}`, data);
      },

      deleteAttendance: async (attendanceId: string) => {
        // For demo: remove from local state immediately
        set(state => ({
          attendance: state.attendance.filter(a => a.id !== attendanceId)
        }));
        
        // In real app, call API here
        console.log(`Deleting attendance ${attendanceId}`);
      },

      startOpening: async (sessionId: string) => {
        set({ isLoading: true });
        try {
          try {
            const res = await startOpeningSession(sessionId);
            set({ session: res.data, isLoading: false });
          } catch (e) {
            // Fallback for demo
            set(state => ({
              session: state.session ? { ...state.session, status: 'OPEN' } : null,
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
