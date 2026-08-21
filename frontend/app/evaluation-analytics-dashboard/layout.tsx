import type { Metadata } from "next";
import Footer from "@/components/home/Footer";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export const metadata: Metadata = {
  title: "Evaluation Analytics Dashboard - TenderEase.lk",
  description:
    "Aggregated evaluation trends, scoring metrics, and participation patterns across all tenders on TenderEase.lk.",
};

export default function EvaluationAnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="eval-analytics-layout">
        <main className="eval-analytics-main">{children}</main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}

