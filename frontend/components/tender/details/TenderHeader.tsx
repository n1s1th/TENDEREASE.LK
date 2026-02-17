import { Calendar, DollarSign, Building2, Clock } from "lucide-react";

export default function TenderHeader() {
  return (
    <div className="bg-white p-3 rounded-md shadow-sm space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">
            Open
          </span>

          <p className="text-xs text-gray-500 mt-1">
            Tender ID: MOI-INF-2025-042
          </p>

          <h1 className="text-lg font-semibold mt-1">
            Construction of Urban Drainage Improvement System – Colombo Zone 03
          </h1>

          <p className="text-sm text-gray-500">
            Rehabilitation and expansion of the stormwater drainage network to
            mitigate flooding risks.
          </p>
        </div>

        <button className="bg-orange-700 text-white px-4 py-1.5 rounded-md text-sm hover:bg-orange-800 cursor-pointer transition">
          Submit
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs border-t pt-2">
        <div className="flex gap-2">
          <Calendar size={18} className="text-orange-600" />
          <div>
            <p className="text-gray-500">Closing Date</p>
            <p className="font-medium">July 30, 2025</p>
          </div>
        </div>

        <div className="flex gap-2">
          <DollarSign size={18} className="text-orange-600" />
          <div>
            <p className="text-gray-500">Estimated Budget</p>
            <p className="font-medium">LKR 125,000,000</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Building2 size={18} className="text-orange-600" />
          <div>
            <p className="text-gray-500">Department</p>
            <p className="font-medium">
              Ministry of Infrastructure Development
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Clock size={18} className="text-orange-600" />
          <div>
            <p className="text-gray-500">Time Remaining</p>
            <p className="font-medium">18 Days 4 Hours</p>
          </div>
        </div>
      </div>
    </div>
  );
}
