import { TenderTemplateBuilder } from "@/components/tender/template/TenderTemplateBuilder";

export default function TenderTemplatePage() {
  return (
    <div className="min-h-screen bg-grey-1/50 flex flex-col">
      <TenderTemplateBuilder />
    </div>
  );
}
