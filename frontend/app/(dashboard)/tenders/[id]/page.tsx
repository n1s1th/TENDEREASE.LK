"use client";

import { useState } from "react";
import TopNavigation from "@/components/tender/details/TopNavigation";
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

  const renderSection = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewSection />;
      case "requirements":
        return <RequirementsSection />;
      case "documents":
        return <DocumentsSection />;
      case "addenda":
        return <AddendaSection />;
      case "clarifications":
        return <ClarificationsSection />;
      case "timeline":
        return <TimelineSection />;
      case "contact":
        return <ContactSection />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">

      <TopNavigation />

      {/* FULL WIDTH CONTAINER */}
      <div className="w-full px-3 py-3 space-y-2">

        <TenderHeader />
        <SpecialRequirements />
        <TenderTabs active={activeTab} setActive={setActiveTab} />
        {renderSection()}

        <div className="flex flex-col sm:flex-row justify-between gap-2 bg-white p-3 rounded-md shadow-sm">
          <button className="px-4 py-2 border rounded-md hover:bg-gray-50 cursor-pointer text-sm">
            Save for Later
          </button>

          <div className="flex gap-2">
            <button className="px-4 py-2 border rounded-md hover:bg-gray-50 cursor-pointer text-sm">
              Print details
            </button>
            <button className="px-4 py-2 bg-orange-700 text-white rounded-md hover:bg-orange-800 cursor-pointer text-sm">
              Submit Bid
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
