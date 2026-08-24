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

  fetchSession: (tenderId: string, silent?: boolean) => Promise<void>;
  fetchAttendance: (sessionId: string, silent?: boolean) => Promise<void>;
  markAttendance: (sessionId: string, name: string, designation: string, email: string, organisation?: string, role?: string, officerId?: string) => Promise<void>;
  updateAttendance: (attendanceId: string, data: Partial<OpeningAttendance>) => Promise<void>;
  deleteAttendance: (attendanceId: string) => Promise<void>;
  startOpening: (sessionId: string) => Promise<void>;
}

export const useOpeningStore = create<OpeningState>()(
  devtools(
    (set, get) => ({
      session: null as OpeningSession | null,
      attendance: [] as OpeningAttendance[],
      isLoading: false,
      error: null as string | null,

      fetchSession: async (tenderId: string, silent = false) => {
        if (!silent) set({ isLoading: true, error: null });
        const token = useAuthStore.getState().token || undefined;
        const res = await fetchOpeningSession(tenderId, token);
        
        if (res && res.success && res.data) {
          let sessionData = res.data;
          console.log("fetchSession API success:", sessionData);
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
        } else {
          console.warn("fetchSession API failed or returned error payload, falling back to DEMO session:", res?.message);
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

      fetchAttendance: async (sessionId: string, silent = false) => {
        if (!silent) set({ isLoading: true });
        const token = useAuthStore.getState().token || undefined;
        const res = await fetchAttendance(sessionId, token);
        if (res && res.success && res.data) {
          console.log(`fetchAttendance API success for session ${sessionId}, count:`, res.data?.length);
          const mapped = res.data.map(item => ({
            ...item,
            email: item.email || item.officerId
          }));
          set({ attendance: mapped, isLoading: false });
        } else {
          console.warn(`fetchAttendance API failed or returned error payload for session ${sessionId}:`, res?.message);
          set({ isLoading: false });
        }
      },

      markAttendance: async (sessionId: string, name: string, designation: string, email: string, organisation?: string, role?: string, officerIdFromForm?: string) => {
        set({ isLoading: true });
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
        
        const token = useAuthStore.getState().token || undefined;
        const res = await markAttendance(sessionId, { officerId, officerName: name, designation, email, organisation, role }, token);
        if (res && res.success) {
          const fetchRes = await fetchAttendance(sessionId, token);
          if (fetchRes && fetchRes.success && fetchRes.data) {
            const mapped = fetchRes.data.map(item => ({
              ...item,
              email: item.email || item.officerId
            }));
            set({ attendance: mapped, isLoading: false });
          } else {
            set({ isLoading: false });
          }
        } else {
          console.warn("markAttendance API failed, falling back to local memory:", res?.message);
          // Fallback for demo: add to local state if API fails
          set(state => ({ 
            attendance: [...state.attendance, newEntry],
            isLoading: false 
          }));
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
        const token = useAuthStore.getState().token || undefined;
        const res = await deleteAttendanceRecord(attendanceId, token);
        
        if (res && res.success) {
          set(state => ({
            attendance: state.attendance.filter(a => a.id !== attendanceId),
            isLoading: false
          }));
        } else {
          console.warn("Delete attendance API failed, falling back locally:", res?.message);
          set(state => ({
            attendance: state.attendance.filter(a => a.id !== attendanceId),
            isLoading: false
          }));
        }
      },

      startOpening: async (sessionId: string) => {
        set({ isLoading: true });
        const token = useAuthStore.getState().token || undefined;
        const officerName = useAuthStore.getState().user?.name || "Procurement Officer";
        const res = await startOpeningSession(sessionId, officerName, token);
        if (res && res.success && res.data) {
          set({ session: res.data, isLoading: false });
          
          if (res.data?.tenderId) {
            try {
              const { updateTenderStatus } = await import("@/services/tender.service");
              await updateTenderStatus(res.data.tenderId, "OPEN");
            } catch (err) {
              console.warn("Failed to update tender status to OPEN:", err);
            }
          }
        } else {
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
              console.warn("Failed to update tender status to OPEN on fallback:", err);
            }
          }
        }
      }
    }),
    { name: "OpeningStore" }
  )
);
