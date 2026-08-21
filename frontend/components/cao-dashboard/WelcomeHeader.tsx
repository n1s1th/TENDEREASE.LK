"use client";

import { useAuthStore } from "@/store";

export default function WelcomeHeader() {
  const { user } = useAuthStore();
  
  if (!user) return null;
  
  // Use username first, fallback to name, then "User"
  const displayName = user.username || user.name || user.firstName || "User";
  
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <h2 style={{
        fontSize: "1.85rem",
        fontWeight: 800,
        color: "#953002",
        margin: 0
      }}>
        Welcome, {displayName}!
      </h2>
    </div>
  );
}
