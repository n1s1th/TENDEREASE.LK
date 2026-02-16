export default function TimelineSection() {
  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-6">
      <h2 className="text-lg font-semibold">
        Important Dates
      </h2>

      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="flex justify-between items-center border-l-2 pl-4"
        >
          <div>
            <p className="font-medium">
              Tender Publishing
            </p>
            <p className="text-sm text-gray-500">
              Dec 22, 2025
            </p>
          </div>

          <span
            className={`px-4 py-2 rounded text-sm ${
              i === 0
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {i === 0 ? "Completed" : "Upcoming"}
          </span>
        </div>
      ))}

      <div>
        <h3 className="font-semibold mt-6">
          Project Duration
        </h3>
        <p className="text-gray-600">
          Expected contract duration: xx months
        </p>
      </div>
    </div>
  );
}
