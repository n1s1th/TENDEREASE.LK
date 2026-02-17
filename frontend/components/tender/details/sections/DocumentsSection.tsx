import { FileText, Download } from "lucide-react";

export default function DocumentsSection() {
  return (
    <div className="bg-white rounded-xl shadow-sm px-6 py-6 space-y-5">

      <h3 className="text-base font-semibold">
        Tender Documents
      </h3>

      {[1, 2, 3, 4].map((doc) => (
        <div
          key={doc}
          className="bg-amber-50 border border-amber-200 rounded-lg px-5 py-5 flex justify-between items-center"
        >
          <div className="flex items-center gap-4">
            <FileText size={22} className="text-amber-600" />
            <div>
              <p className="text-sm font-medium">
                Document 0{doc}
              </p>
              <p className="text-xs text-gray-500">
                PDF · 235 KB
              </p>
            </div>
          </div>

          <button className="flex items-center gap-2 text-orange-700 text-sm hover:underline cursor-pointer">
            <Download size={16} />
            Download
          </button>
        </div>
      ))}

    </div>
  );
}
