import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { OpeningSession, OpeningAttendance } from "@/lib/types/opening.types";
import { fetchOpeningSession, fetchAttendance, markAttendance, startOpeningSession, deleteAttendanceRecord } from "@/lib/api/opening.api";
import { useAuthStore } from "@/store";

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
          const token = useAuthStore.getState().token || undefined;
          const res = await fetchOpeningSession(tenderId, token);
          let sessionData = res.data;
          try {
            const { getTenderById } = await import("@/services/tender.service");
            const tenderData = await getTenderById(tenderId);
            if (tenderData && (tenderData.status === "OPEN" || tenderData.status === "EVALUATION")) {
              if (sessionData.status === "SCHEDULED") {
                sessionData.status = "OPEN";
              }
            } else if (tenderData && (tenderData.status === "CLOSED" || tenderData.status === "COMPLETED")) {
              sessionData.status = "CLOSED";
            }
          } catch (e) {
            console.warn("Failed to check tender status in fetchSession:", e);
          }
          set({ session: sessionData, isLoading: false });
        } catch (err: any) {
          // Fallback: Set a demo session with the real tenderId so frontend features work correctly
          let status: "SCHEDULED" | "OPEN" | "CLOSED" = "SCHEDULED";
          try {
            const { getTenderById } = await import("@/services/tender.service");
            const tenderData = await getTenderById(tenderId);
            if (tenderData && (tenderData.status === "OPEN" || tenderData.status === "EVALUATION")) {
              status = "OPEN";
            } else if (tenderData && (tenderData.status === "CLOSED" || tenderData.status === "COMPLETED")) {
              status = "CLOSED";
            }
          } catch (e) {
            console.warn("Failed to check tender status in fetchSession catch block:", e);
          }
          set({ 
            session: {
              id: "DEMO-SESSION-" + tenderId,
              tenderId: tenderId,
              tenderTitle: "",
              status: status,
              scheduledOpeningTime: new Date().toISOString(),
              bidsCount: 0
            },
            isLoading: false 
          });
        }
      },

      fetchAttendance: async (sessionId: string) => {
        set({ isLoading: true });
        try {
          const token = useAuthStore.getState().token || undefined;
          const res = await fetchAttendance(sessionId, token);
          set({ attendance: res.data, isLoading: false });
        } catch (err: any) {
          set({ isLoading: false });
        }
      },

      markAttendance: async (sessionId: string, name: string, designation: string, email: string, organisation?: string, role?: string, officerIdFromForm?: string) => {
        set({ isLoading: true });
        try {
          const officerId = officerIdFromForm || email;
          const newEntry: OpeningAttendance = {
            id: Math.random().toString(36).substr(2, 9),
            officerId,
            officerName: name,
            designation,
            email,
            organisation,
            role,
            attendanceTime: new Date().toISOString()
          };
          
          try {
            const token = useAuthStore.getState().token || undefined;
            await markAttendance(sessionId, { officerId, officerName: name, designation, email, organisation, role }, token);
            const res = await fetchAttendance(sessionId, token);
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
        set({ isLoading: true });
        try {
          try {
            const token = useAuthStore.getState().token || undefined;
            await deleteAttendanceRecord(attendanceId, token);
          } catch (e) {
            console.warn("Delete attendance API fallback:", e);
          }
          set(state => ({
            attendance: state.attendance.filter(a => a.id !== attendanceId),
            isLoading: false
          }));
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
        }
      },

      startOpening: async (sessionId: string) => {
        set({ isLoading: true });
        try {
          try {
            const token = useAuthStore.getState().token || undefined;
            const res = await startOpeningSession(sessionId, token);
            set({ session: res.data, isLoading: false });
            
            if (res.data?.tenderId) {
              try {
                const { updateTenderStatus } = await import("@/services/tender.service");
                await updateTenderStatus(res.data.tenderId, "OPEN");
              } catch (err) {
                console.error("Failed to update tender status to OPEN:", err);
              }
            }
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
                    bidsCount: 0 
                  } as OpeningSession,
              isLoading: false
            }));
            
            const currentSession = get().session;
            if (currentSession?.tenderId && currentSession.tenderId !== "DEMO-TENDER") {
              try {
                const { updateTenderStatus } = await import("@/services/tender.service");
                await updateTenderStatus(currentSession.tenderId, "OPEN");
              } catch (err) {
                console.error("Failed to update tender status to OPEN on fallback:", err);
              }
            }
          }
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
        }
      }
    }),
    { name: "OpeningStore" }
  )
);
