import { AlertTriangle } from "lucide-react";

export default function SpecialRequirements() {
  return (
    <div className="bg-white rounded-xl shadow-sm px-6 py-6">

      <div className="flex items-start gap-4">

        <AlertTriangle size={24} className="text-orange-600 mt-1" />

        <div className="space-y-3">
          <h3 className="text-base font-semibold">
            Special Requirements
          </h3>

          <ul className="list-disc ml-6 text-sm text-gray-600 space-y-2 leading-relaxed">
            <li>All bidders must have minimum 5 years of relevant experience.</li>
            <li>Submission must include audited financial statements (last 3 years).</li>
            <li>Bid security of 2% of estimated contract value is mandatory.</li>
            <li>Site inspection is compulsory before submission.</li>
          </ul>
        </div>

      </div>

    </div>
  );
}
