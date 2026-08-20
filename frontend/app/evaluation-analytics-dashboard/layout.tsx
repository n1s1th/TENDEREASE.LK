import type { Metadata } from "next";
import Footer from "@/components/home/Footer";

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
    <div className="eval-analytics-layout">
      <main className="eval-analytics-main">{children}</main>
      <Footer />
    </div>
  );
}
