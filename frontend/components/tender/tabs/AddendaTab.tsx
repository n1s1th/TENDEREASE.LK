"use client";

import { useEffect, useState } from "react";
import { FileText, Download, AlertCircle, Loader2 } from "lucide-react";
import { getAddenda } from "@/services/tender.service";

interface AddendumVersion {
  versionNumber: number;
  secureUrl: string;
  originalFilename: string;
  contentType: string;
  fileSize: number;
  changeDescription: string;
  createdAt: string;
}

interface Addendum {
  id: number;
  amendmentNumber: number;
  title: string;
  description: string;
  currentVersionNumber: number;
  currentVersion: AddendumVersion | null;
  createdAt: string;
}

interface AddendaTabProps {
  tenderId: string;
}

export default function AddendaTab({ tenderId }: AddendaTabProps) {
  const [addenda, setAddenda] = useState<Addendum[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenderId) return;
    setLoading(true);
    getAddenda(tenderId)
      .then((res: any) => {
        const data = Array.isArray(res) ? res : res?.data ?? [];
        setAddenda(data);
      })
      .catch(() => setAddenda([]))
      .finally(() => setLoading(false));
  }, [tenderId]);

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

  const formatFileSize = (bytes: number | undefined): string => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getDownloadUrl = (url: string | undefined): string => {
    if (!url) return "#";
    // If backend returned localhost but we're in prod, fix it using frontend env var
    const publicBase = process.env.NEXT_PUBLIC_TENDER_SERVICE_URL || "https://api.tenderease.me";
    if (url.includes("localhost") && publicBase && !publicBase.includes("localhost")) {
      return url.replace(/^http:\/\/(localhost|127\.0\.0\.1):\d+/, publicBase);
    }
    return url;
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#a03d11] animate-spin" />
        <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Loading Addenda…</p>
      </div>
    );
  }

  if (addenda.length === 0) {
    return (
      <div className="py-20 text-center space-y-4 bg-gray-50 border border-dashed border-gray-200 rounded-[2rem]">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
          <AlertCircle size={32} />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-black text-gray-900">No Addenda Issued</h3>
          <p className="text-sm text-gray-500">
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
          Official amendments ({addenda.length} total). All addenda must be acknowledged in your bid.
        </p>
      </div>

      <div className="space-y-6">
        {addenda.map((amendment, index) => {
          const latestFile = amendment.currentVersion;
          return (
            <div key={amendment.id ?? index} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">

              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-[#a03d11]">
                    Addendum {String(amendment.amendmentNumber || index + 1).padStart(3, "0")}
                  </span>
                  <span className="text-xs font-medium text-gray-400">
                    {formatDate(amendment.createdAt)}
                  </span>
                  {amendment.currentVersionNumber > 1 && (
                    <span className="text-[10px] font-black px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full uppercase tracking-widest">
                      v{amendment.currentVersionNumber}
                    </span>
                  )}
                </div>
                <span className="px-4 py-1 bg-white border border-gray-100 text-gray-400 text-[10px] font-bold uppercase rounded-full">
                  Mandatory
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">{amendment.title}</h3>
                  {amendment.description && (
                    <p className="text-sm text-gray-500">{amendment.description}</p>
                  )}
                </div>

                {latestFile ? (
                  <div className="bg-[#fff9f1] border border-[#ffedda] rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#fbbd05] flex items-center justify-center text-white shrink-0">
                        <FileText size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {latestFile.originalFilename || "addendum.pdf"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {latestFile.contentType || "PDF"}
                          {latestFile.fileSize ? ` · ${formatFileSize(latestFile.fileSize)}` : ""}
                          {latestFile.changeDescription ? ` · ${latestFile.changeDescription}` : ""}
                        </p>
                      </div>
                    </div>

                    <a
                      href={getDownloadUrl(latestFile.secureUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={latestFile.originalFilename}
                      className="flex items-center gap-2 text-[#a03d11] text-sm font-bold px-4 py-2 rounded-xl border border-[#ffedda] hover:bg-[#a03d11] hover:text-white transition-all"
                    >
                      <Download size={16} />
                      Download
                    </a>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-400 font-medium">No file uploaded for this addendum yet.</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-[#fff9f1] border border-[#ffedda] rounded-xl p-5 flex items-center gap-4">
        <AlertCircle className="text-[#a03d11] shrink-0" size={20} />
        <p className="text-sm text-[#a03d11]">
          <b>Important:</b> All mandatory addenda must be acknowledged before submitting your bid.
        </p>
      </div>
    </div>
  );
}