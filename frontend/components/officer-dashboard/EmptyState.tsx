"use client";

import { Inbox } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export default function EmptyState({
  title = "No data available",
  description = "Data will appear here once the backend is connected.",
}: EmptyStateProps) {
  return (
    <div className="dash-empty" id="empty-state">
      <div className="dash-empty-icon">
        <Inbox size={64} />
      </div>
      <div className="dash-empty-title">{title}</div>
      <div className="dash-empty-desc">{description}</div>
    </div>
  );
}
