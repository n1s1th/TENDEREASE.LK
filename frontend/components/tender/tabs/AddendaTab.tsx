"use client";

import { FileText, Download, AlertCircle } from "lucide-react";

export default function AddendaSection({ addenda }: { addenda: any[] }) {
  const displayAddenda = addenda || [];

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  if (displayAddenda.length === 0) {
    return (
      <div className="py-20 text-center space-y-4 bg-gray-5/50 border border-dashed border-gray-100 rounded-[2rem]">
        <div className="w-16 h-16 bg-gray-5 rounded-full flex items-center justify-center mx-auto text-gray-3">
          <AlertCircle size={32} />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-black text-black-1">No Addenda Issued</h3>
          <p className="text-sm text-gray-3">
            There are no amendments or addenda issued for this tender yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-gray-900">Addenda and Amendments</h2>
        <p className="text-sm font-medium text-gray-500">
          Official amendments. All addenda must be acknowledged in your bid.
        </p>
      </div>

      <div className="space-y-6">
        {displayAddenda.map((amendment: any, index: number) => (
          <div key={index} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
            
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-[#a03d11]">
                  Addendum {String(amendment.amendmentNumber || index + 1).padStart(3, "0")}
                </span>
                <span className="text-xs font-medium text-gray-400">
                  {formatDate(amendment.createdAt)}
                </span>
              </div>

              <span className="px-4 py-1 bg-white border border-gray-100 text-gray-400 text-[10px] font-bold uppercase rounded-full">
                Mandatory
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">
                  {amendment.title}
                </h3>
                <p className="text-sm text-gray-500">
                  {amendment.description}
                </p>
              </div>

              <div className="bg-[#fff9f1] border border-[#ffedda] rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#fbbd05] flex items-center justify-center text-white">
                    <FileText size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {amendment.fileName || "addendum.pdf"}
                    </p>
                    <p className="text-xs text-gray-400">PDF</p>
                  </div>
                </div>

                <button 
                  onClick={() => window.open(amendment.downloadUrl, "_blank")}
                  className="flex items-center gap-2 text-[#fbbd05] text-sm font-bold hover:underline"
                >
                  <Download size={18} />
                  Download
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#fff9f1] border border-[#ffedda] rounded-xl p-5 flex items-center gap-4">
        <AlertCircle className="text-[#a03d11]" size={20} />
        <p className="text-sm text-[#a03d11]">
          <b>Important:</b> All mandatory addenda must be acknowledged.
        </p>
      </div>
    </div>
  );
}