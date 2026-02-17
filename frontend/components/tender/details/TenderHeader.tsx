import { CalendarDays, DollarSign, Building2, Clock } from "lucide-react";

export default function TenderHeader() {
  return (
    <div className="bg-white rounded-xl shadow-sm px-8 py-8 space-y-7">

      {/* Top Section */}
      <div className="flex flex-col lg:flex-row justify-between gap-6">

        <div className="space-y-3 max-w-3xl">

          <span className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-md">
            Open
          </span>

          <p className="text-sm text-gray-500">
            Tender ID: MOI-INF-2025-042
          </p>

          {/* FONT SIZE SAME AS BEFORE */}
          <h1 className="text-2xl font-semibold leading-snug">
            Construction of Urban Drainage Improvement System – Colombo Zone 03
          </h1>

          <p className="text-base text-gray-600 leading-relaxed">
            Rehabilitation and expansion of the stormwater drainage network
            to mitigate flooding risks and improve urban water management.
          </p>

        </div>

        <div className="flex items-start">
          <button className="bg-orange-700 text-white px-6 py-2 rounded-md text-sm hover:bg-orange-800 transition cursor-pointer">
            Submit
          </button>
        </div>

      </div>

      {/* Meta Cards (Balanced Height) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        <div className="bg-amber-50 border border-amber-200 p-5 rounded-lg hover:shadow-sm transition">
          <div className="flex items-center gap-3">
            <CalendarDays size={22} className="text-amber-600" />
            <div>
              <p className="text-sm text-gray-600">
                Closing Date
              </p>
              <p className="text-base font-semibold">
                July 30, 2025
              </p>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-5 rounded-lg hover:shadow-sm transition">
          <div className="flex items-center gap-3">
            <DollarSign size={22} className="text-amber-600" />
            <div>
              <p className="text-sm text-gray-600">
                Estimated Budget
              </p>
              <p className="text-base font-semibold">
                LKR 125,000,000
              </p>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-5 rounded-lg hover:shadow-sm transition">
          <div className="flex items-center gap-3">
            <Building2 size={22} className="text-amber-600" />
            <div>
              <p className="text-sm text-gray-600">
                Department
              </p>
              <p className="text-base font-semibold">
                Ministry of Infrastructure Development
              </p>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-5 rounded-lg hover:shadow-sm transition">
          <div className="flex items-center gap-3">
            <Clock size={22} className="text-amber-600" />
            <div>
              <p className="text-sm text-gray-600">
                Time Remaining
              </p>
              <p className="text-base font-semibold">
                18 Days 4 Hours
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
