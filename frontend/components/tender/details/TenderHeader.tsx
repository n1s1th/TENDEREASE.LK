export default function TenderHeader() {
  return (
    <div className="bg-white p-3 rounded-md shadow-sm space-y-2">

      <div className="flex justify-between items-start">
        <div>
          <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">
            Open
          </span>

          <p className="text-xs text-gray-500 mt-1">
            Tender ID: TND-2024-001234
          </p>

          <h1 className="text-lg font-semibold mt-1">
            Title of The Tender xxxxxxxxxxxxx
          </h1>

          <p className="text-sm text-gray-500">
            This is the description of the tender
          </p>
        </div>

        <button
          className="
            bg-orange-700 
            text-white 
            px-4 
            py-1.5 
            rounded-md 
            text-sm
            cursor-pointer
            transition-all 
            duration-200 
            hover:bg-orange-800 
            hover:shadow-md
            active:scale-95
          "
        >
          Submit
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs border-t pt-2">
        <div>
          <p className="text-gray-500">Closing Date</p>
          <p className="font-medium">Dec 22, 2025</p>
        </div>
        <div>
          <p className="text-gray-500">Estimated Budget</p>
          <p className="font-medium">RS.5000000</p>
        </div>
        <div>
          <p className="text-gray-500">Department</p>
          <p className="font-medium">Ministry of Infrastructure</p>
        </div>
        <div>
          <p className="text-gray-500">Time Remaining</p>
          <p className="font-medium">10 Days 5 Hours</p>
        </div>
      </div>

    </div>
  );
}
