export default function AddendaSection() {
  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          Addenda and Amendments
        </h2>

        <button className="bg-orange-700 text-white px-4 py-2 rounded-md">
          Submit Question
        </button>
      </div>

      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="border rounded-lg p-5 space-y-4"
        >
          <div className="flex justify-between">
            <div>
              <p className="font-semibold">
                Addendum 001
              </p>
              <p className="text-sm text-gray-500">
                Dec 5, 2024
              </p>
            </div>

            <span className="bg-red-100 text-red-600 text-xs px-3 py-1 rounded">
              Mandatory
            </span>
          </div>

          <p className="font-medium">
            Revised Technical Specifications - HVAC
          </p>

          <p className="text-gray-600 text-sm">
            Updated energy efficiency requirements.
            Minimum SEER rating increased.
          </p>

          <div className="bg-amber-50 p-4 rounded flex justify-between items-center">
            <div className="flex gap-3 items-center">
              <div className="bg-yellow-500 w-10 h-10 rounded flex items-center justify-center text-white">
                📄
              </div>
              addendum-001-hvac.pdf
            </div>

            <button className="text-orange-600">
              Download
            </button>
          </div>
        </div>
      ))}

      <div className="bg-amber-100 p-4 rounded text-orange-700 text-sm">
        Important: All mandatory addenda must be acknowledged.
      </div>
    </div>
  );
}
