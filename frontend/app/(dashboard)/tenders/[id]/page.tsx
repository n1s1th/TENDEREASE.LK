"use client";

import { useState } from "react";
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

      <div className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">

        <TenderHeader />
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
