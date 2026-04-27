"use client";

import dynamic from "next/dynamic";

const TenderTemplateBuilder = dynamic(
  () => import("@/components/tender/template/TenderTemplateBuilder").then(mod => mod.TenderTemplateBuilder),
  { ssr: false }
);

export default function TenderTemplatePage() {
  return (
    <div className="min-h-screen bg-grey-1/50 flex flex-col">
      <TenderTemplateBuilder />
    </div>
  );
}
