import ProtectedRoute from "@/components/auth/ProtectedRoute";
import React from "react";

export default function ReportsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        // This wrapper forces the user to log in before seeing the children
        <ProtectedRoute>
            {children}
        </ProtectedRoute>
    );
}