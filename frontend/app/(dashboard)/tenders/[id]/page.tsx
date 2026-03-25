"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { mockTenders } from "@/lib/mock-tenders";

import TopNavigation from "@/components/tender/TopNavigation";
import TenderHeader from "@/components/tender/details/TenderHeader";
import SpecialRequirements from "@/components/tender/details/SpecialRequirements";
import TenderTabs from "@/components/tender/details/TenderTabs";

import OverviewSection from "@/components/tender/details/sections/OverviewSection";
import RequirementsSection from "@/components/tender/details/sections/RequirementsSection";
import DocumentsSection from "@/components/tender/details/sections/DocumentsSection";
import AddendaSection from "@/components/tender/details/sections/AddendaSection";
import ClarificationsSection from "@/components/tender/details/sections/ClarificationsSection";
import TimelineSection from "@/components/tender/details/sections/TimelineSection";
import ContactSection from "@/components/tender/details/sections/ContactSection";

export default function TenderDetailsPage() {
  const [activeTab, setActiveTab] = useState("overview");

  // ✅ Get ID from URL
  const params = useParams();
  const id = params?.id as string;

  // ✅ Find mock tender
  const tender = mockTenders.find((t) => t.id === id);

  // Optional safety (if ID not found)
  if (!tender) {
    return (
      <div className="p-10 text-center text-gray-500">
        Tender not found.
      </div>
    );
  }

  const renderSection = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewSection tender={tender} />;
      case "requirements":
        return <RequirementsSection tender={tender} />;
      case "documents":
        return <DocumentsSection tender={tender} />;
      case "addenda":
        return <AddendaSection tender={tender} />;
      case "clarifications":
        return <ClarificationsSection tender={tender} />;
      case "timeline":
        return <TimelineSection tender={tender} />;
      case "contact":
        return <ContactSection tender={tender} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">

      <TopNavigation />

      <div className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">

        {/* ✅ Pass tender to header */}
        <TenderHeader tender={tender} />

        <SpecialRequirements />
        <TenderTabs active={activeTab} setActive={setActiveTab} />
        {renderSection()}

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-5 rounded-xl shadow-sm">

          <button className="px-6 py-2 border rounded-md hover:bg-gray-50 cursor-pointer text-sm font-medium transition">
            Save for Later
          </button>

          <div className="flex gap-4">
            <button className="px-6 py-2 border rounded-md hover:bg-gray-50 cursor-pointer text-sm font-medium transition">
              Print details
            </button>
            <button className="px-7 py-2 bg-orange-700 text-white rounded-md hover:bg-orange-800 cursor-pointer text-sm font-medium transition">
              Submit Bid
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
