import { FileText, Download } from "lucide-react";

export default function DocumentsSection() {
  const docs = [
    "Tender Notice",
    "Technical Specifications",
    "Bill of Quantities",
    "Project Drawings",
    "Conditions of Contract",
  ];

  return (
    <div className="bg-white p-3 rounded-md shadow-sm space-y-3">
      <h2 className="font-semibold text-sm">Tender Documents</h2>

      {docs.map((doc, index) => (
        <div
          key={index}
          className="flex justify-between items-center bg-amber-50 p-3 rounded-md"
        >
          <div className="flex gap-3 items-center">
            <FileText size={18} className="text-yellow-600" />
            <div>
              <p className="text-sm font-medium">{doc}</p>
              <p className="text-xs text-gray-500">PDF · 235 KB</p>
            </div>
          </div>

          <button className="flex items-center gap-1 text-orange-600 text-sm hover:underline cursor-pointer">
            <Download size={16} />
            Download
          </button>
        </div>
      ))}
    </div>
  );
}
