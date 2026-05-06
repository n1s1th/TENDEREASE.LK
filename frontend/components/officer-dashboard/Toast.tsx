"use client";

import { Check, X } from "lucide-react";
import { useOfficerDashboardStore } from "@/store/officer-dashboard/officer-dashboard.store";

export default function Toast() {
  const toasts = useOfficerDashboardStore((s) => s.toasts);
  const dismissToast = useOfficerDashboardStore((s) => s.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div className="dash-toast-container" id="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`dash-toast dash-toast--${toast.type}`}
        >
          <span className="dash-toast-icon">
            <Check size={16} />
          </span>
          <span className="dash-toast-message">{toast.message}</span>
          {toast.actionLabel && (
            <button className="dash-toast-action">{toast.actionLabel}</button>
          )}
          <button
            className="dash-toast-close"
            onClick={() => dismissToast(toast.id)}
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
