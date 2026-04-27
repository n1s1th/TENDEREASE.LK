export default function TenderHeader({ tender }: any) {
  return (
    <div className="bg-white border rounded-xl p-6 space-y-4">

      {/* TOP ROW */}
      <div className="flex justify-between items-center">

        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
            {tender.status}
          </span>

          <p className="text-sm text-gray-500">
            Tender ID: {tender.tenderNumber}
          </p>
        </div>

        <button className="bg-orange-700 text-white px-6 py-2 rounded-lg">
          Submit
        </button>
      </div>

      {/* TITLE */}
      <div>
        <h1 className="text-xl font-semibold">
          {tender.title}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {tender.description}
        </p>
      </div>

      <hr />

      {/* INFO GRID */}
      <div className="grid grid-cols-4 gap-6 text-sm">

        <div>
          <p className="text-gray-400">Closing Date</p>
          <p className="font-medium">{tender.closingDate}</p>
        </div>

        <div>
          <p className="text-gray-400">Estimated Budget</p>
          <p className="font-medium">{tender.estimatedBudget}</p>
        </div>

        <div>
          <p className="text-gray-400">Department</p>
          <p className="font-medium">{tender.departmentName}</p>
        </div>

        <div>
          <p className="text-gray-400">Time Remaining</p>
          <p className="font-medium">10 Days 5 Hours</p>
        </div>

      </div>

    </div>
  );
}