"use client";

import { useState } from "react";
import DetailsTabs from "./DetailsTabs"; 
import OverviewTab from "./tabs/OverviewTab";
import RequirementsTab from "./tabs/RequirementsTab";
import DocumentsTab from "./tabs/DocumentsTab";
import AddendaTab from "./tabs/AddendaTab";
import ClarificationsTab from "./tabs/ClarificationsTab";
import TimelineTab from "./tabs/TimelineTab";
import ContactTab from "./tabs/ContactTab";

export default function TenderTabs({ tender }: any) {
  const [activeTab, setActiveTab] = useState("Overview");

  // ✅ FIX: wait until tender exists
  if (!tender) {
    return <div className="p-10">Loading...</div>;
  }

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-10 shadow-sm space-y-10">
      
      <DetailsTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="min-h-[400px]">
        {activeTab === "Overview" && <OverviewTab tender={tender} />}
        {activeTab === "Requirements" && <RequirementsTab tender={tender} />}
        {activeTab === "Documents" && <DocumentsTab documents={tender.documents} />}
        {activeTab === "Addenda" && <AddendaTab addenda={tender.addenda} />}
        
        {/* 🔥 SAFE NOW */}
        {activeTab === "Clarifications" && (
          <ClarificationsTab 
            clarifications={tender.clarifications} 
            tenderId={tender.id} 
          />
        )}

        {activeTab === "Timeline" && <TimelineTab timeline={tender.timeline} />}
        {activeTab === "Contact" && <ContactTab contact={tender.contacts} />}
      </div>
    </div>
  );
}