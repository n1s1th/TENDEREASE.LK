import { AlertTriangle } from "lucide-react";

export default function SpecialRequirements() {
  return (
    <div className="bg-white p-3 rounded-md shadow-sm flex gap-3">

      <AlertTriangle size={18} className="text-orange-600 mt-0.5" />

      <div className="space-y-2 w-full">

        <p className="text-sm font-semibold">
          Special Requirements
        </p>

        <ul className="list-disc ml-5 text-xs text-gray-600 space-y-1">
          <li>
            Bidders must possess valid CIDA Grade C3 or higher registration.
          </li>
          <li>
            A bid security of LKR 2,500,000 must be submitted with the proposal.
          </li>
          <li>
            Site visits are mandatory prior to submission of bids.
          </li>
          <li>
            All submitted documents must be signed and sealed by an authorized officer.
          </li>
          <li>
            Joint ventures must clearly indicate lead partner responsibilities.
          </li>
        </ul>

        <div className="bg-amber-50 p-2 rounded text-xs text-orange-700">
          Non-compliance with the above requirements may result in
          immediate disqualification of the bid.
        </div>

      </div>
    </div>
  );
}
