export default function DocumentsSection() {
  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-6">
      <h2 className="text-lg font-semibold">
        Tender Documents
      </h2>

      {[...Array(7)].map((_, i) => (
        <div
          key={i}
          className="bg-amber-50 p-4 rounded-lg flex justify-between items-center"
        >
          <div className="flex gap-4 items-center">
            <div className="bg-yellow-500 w-12 h-12 rounded flex items-center justify-center text-white text-lg">
              📄
            </div>
            <div>
              <p className="font-medium">
                Document 0{i + 1}
              </p>
              <p className="text-sm text-gray-500">
                PDF · 235 KB
              </p>
            </div>
          </div>

          <button className="text-orange-600 font-medium">
            Download
          </button>
        </div>
      ))}

      <div className="bg-amber-100 p-4 rounded text-sm text-orange-700">
        <strong>Note:</strong> All documents must be reviewed carefully.
        Questions must be submitted before closing date.
      </div>
    </div>
  );
}
