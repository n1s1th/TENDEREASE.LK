import { FileText, Download } from "lucide-react";

interface Addendum {
  id: string;
  date: string;
  title: string;
  description: string;
  file: string;
}

const addenda: Addendum[] = [
  {
    id: "Addendum 001",
    date: "Dec 5, 2024",
    title: "Revised Technical Specifications - HVAC",
    description:
      "Updated energy efficiency requirements. Minimum SEER rating increased from 14 to 16.",
    file: "addendum-001-hvac.pdf",
  },
  {
    id: "Addendum 002",
    date: "Dec 12, 2024",
    title: "Amendment to Bill of Quantities",
    description:
      "Revised quantities for drainage pipe installation and updated cost breakdown structure.",
    file: "addendum-002-boq.pdf",
  },
];

export default function AddendaSection() {
  return (
    <div className="bg-white rounded-xl shadow-sm px-6 py-6 space-y-6">

      <h2 className="font-semibold text-sm">
        Addenda and Amendments
      </h2>

      {addenda.map((item, index) => (
        <div
          key={index}
          className="border rounded-lg px-5 py-5 space-y-4"
        >

          {/* Header Row */}
          <div className="flex items-center gap-4 text-sm">

            <span className="font-medium text-orange-700">
              {item.id}
            </span>

            <span className="text-gray-500 text-xs">
              {item.date}
            </span>

            <span className="text-xs px-3 py-1 border border-orange-400 text-orange-700 rounded-md">
              Mandatory
            </span>

          </div>

          {/* Title */}
          <p className="font-medium text-sm">
            {item.title}
          </p>

          {/* Description */}
          <p className="text-xs text-gray-600 leading-relaxed">
            {item.description}
          </p>

          {/* File Row */}
          <div className="flex justify-between items-center bg-amber-50 border border-amber-200 rounded-lg px-4 py-4">

            <div className="flex items-center gap-3">
              <FileText size={18} className="text-amber-600" />
              <span className="text-xs">
                {item.file}
              </span>
            </div>

            <button className="flex items-center gap-2 text-orange-700 text-xs hover:underline cursor-pointer">
              <Download size={16} />
              Download
            </button>

          </div>

        </div>
      ))}

      {/* Footer Note */}
      <div className="bg-amber-100 rounded-lg px-4 py-4 text-xs text-orange-700 leading-relaxed">
        Important: All mandatory addenda must be acknowledged.
        Failure to comply may result in disqualification.
      </div>

    </div>
  );
}
