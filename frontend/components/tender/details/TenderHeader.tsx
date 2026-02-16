export default function TenderHeader() {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex justify-between items-start">
        <div>
          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
            Open
          </span>
          <p className="text-sm text-gray-500 mt-1">
            Tender ID: TND-2024-001234
          </p>

          <h1 className="text-2xl font-semibold mt-2">
            Title of The Tender xxxxxxxxxxxxx
          </h1>

          <p className="text-gray-500 mt-2">
            This is the description of the tender
          </p>
        </div>

        <button className="bg-orange-700 text-white px-6 py-2 rounded-md">
          Submit
        </button>
      </div>

      <div className="grid grid-cols-4 gap-6 mt-6 text-sm border-t pt-4">
        <div>
          <p className="text-gray-500">Closing Date</p>
          <p className="font-semibold">Dec 22, 2025</p>
        </div>
        <div>
          <p className="text-gray-500">Estimated Budget</p>
          <p className="font-semibold">RS.5000000</p>
        </div>
        <div>
          <p className="text-gray-500">Department</p>
          <p className="font-semibold">Ministry of Infrastructure</p>
        </div>
        <div>
          <p className="text-gray-500">Time Remaining</p>
          <p className="font-semibold">10 Days 5 Hours</p>
        </div>
      </div>
    </div>
  );
}
